import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from "../../../../../environments/environment"
import { ethers } from 'ethers';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Router } from "@angular/router";
declare var $: any;
@Component({
  selector: '.wrapper',
  templateUrl: './asset.component.html',
})
export class AssetComponent implements OnInit, AfterViewInit {
  public web3 = window['ethereum'];
  public provider;
  public tradeData = { "nftAddress": null, "tokenId": null, "tokenValidity": null, "percentage": null, "categoryId": null, "desc": null, "partyAddress": null, "nftTokenAddress": null, 'exchangeId': null, "expiry": null, "tokenAddress": null, "tokenName": null, "tokenAmount": null, "days": null, "hours": null, "minutes": null, "seconds": null };
  public exchangeContractInstance;
  public $counter: Observable<number>;
  public subscription: Subscription;
  public exchangeId;
  public createTrade = false;
  public txSuccess = false;
  public allEchangeIds = [];
  public metamaskNotPresent = false;
  public wrongNetwork = false;
  public ownerNft = false;
  public show = false;
  public approving = false;
  public buying = false;
  public cancelling = false;
  public creating = false;
  public approvingCreate = false;
  public topup = false;
  public expiryDate;
  public tokenAmount;
  public error = false;
  public topupAmount;
  public validtill;
  public approveTopUp = false;
  public errorTopup = false;
  constructor(private router: Router) {

  }

  ngOnInit(): void {
    if (this.web3 != undefined) {
      if (this.web3.selectedAddress != null) {
        this.provider = new ethers.providers.Web3Provider(this.web3);
        this.provider.getNetwork().then(network => {
          if (network.chainId != 42) {
            this.wrongNetwork = true;
            $("#modal-metamaskCheck1").modal("show");
          } else {
            this.exchangeContractInstance = new ethers.Contract(environment.exchangeAddress, environment.exchangeAbi, this.provider.getSigner());
            this.availableTradeData();
          }
        });
      } else {
        $("#modal-metamaskCheck1").modal("show");
      }
    } else {
      this.metamaskNotPresent = true;
      $("#modal-metamaskCheck1").modal("show");
    }
  }

  ngAfterViewInit(): void {
    if (window['ethereum'] != undefined) {
      window['ethereum'].on('accountsChanged', () => {
        setTimeout(async () => {
          window.location.reload();
        })
      });

      window['ethereum'].on('networkChanged', () => {
        setTimeout(async () => {
          window.location.reload();
        })
      });
    }
  }

  async availableTradeData() {
    let data = await this.exchangeEventData();
    for (let i = 0; i < data.length; i++) {
      let exchangeId = parseInt(data[i].decodedLog.args._exchangeID);
      let nftData = await this.exchangeContractInstance.exchange(exchangeId);
      let rawData = {
        tokenId: parseInt(nftData.tokenID),
        exchangeId: exchangeId
      }
      this.allEchangeIds.push(rawData)
    }
    let tokenId = this.router.url.split('/')[2];
    let exchangeId = this.allEchangeIds.filter(el => el.tokenId == tokenId);
    if (exchangeId.length != 0) {
      this.exchangeId = exchangeId[exchangeId.length - 1].exchangeId;
      let nftDetails = await this.exchangeContractInstance.exchange(this.exchangeId);
      if (nftDetails.party1.toLowerCase() == this.web3.selectedAddress.toLowerCase()) {
        this.ownerNft = true;
      }
      let couponInstance = new ethers.Contract(environment.PlotxCouponAddress, environment.plotxCouponAbi, this.provider);
      let categoryData = await couponInstance.couponCategory(nftDetails.tokenID);
      let standardTime = new Date(parseInt(categoryData.validity) * 1000);
      let time = standardTime.toString().substr(4, 12);
      let timeFormat = this.formatAMPM(new Date(parseInt(categoryData.validity) * 1000));
      this.tradeData["tokenValidity"] = time + " " + timeFormat
      this.tradeData["categoryId"] = parseInt(categoryData.categoryId);
      let descData = await couponInstance._defaultCouponType(categoryData.categoryId);
      this.show = true;
      this.tradeData["desc"] = descData.desc;
      this.tradeData["percentage"] = descData.perc;
      this.tradeData["partyAddress"] = this.truncateAddress(nftDetails.party1);
      this.tradeData["nftAddress"] = nftDetails.token1;
      this.tradeData["nftTokenAddress"] = this.truncateAddress(nftDetails.token1);
      this.tradeData["tokenId"] = parseInt(nftDetails.tokenID);
      if (nftDetails.status == 0) {
        let tokenInstance = new ethers.Contract(nftDetails.token2, environment.ERC20_Token_Abi, this.provider);
        let tokenName = await tokenInstance.name()
        this.tradeData["expiry"] = parseInt(nftDetails.expiry);
        this.tradeData["tokenAddress"] = nftDetails.token2;
        this.tradeData["tokenName"] = tokenName;
        this.tradeData["amount"] = nftDetails.amount2OrTokenID,
          this.tradeData["tokenAmount"] = this.toDecimal(parseFloat(ethers.utils.formatEther(nftDetails.amount2OrTokenID)), 2);
        let t = 0;
        this.$counter = interval(1000).pipe(map((x) => {
          let deadline = this.tradeData.expiry * 1000;
          let now = new Date().getTime();
          t = (deadline) - now;
          return x;
        }));
        if (t >= 0) {
          this.subscription = this.$counter.subscribe((x) => this.countDownTimer(+t));
        }
      } else {
        this.createTrade = true;
      }
    } else {
      let couponInstance = new ethers.Contract(environment.PlotxCouponAddress, environment.plotxCouponAbi, this.provider);
      let categoryData = await couponInstance.couponCategory(tokenId);
      let standardTime = new Date(parseInt(categoryData.validity) * 1000);
      let time = standardTime.toString().substr(4, 12);
      let timeFormat = this.formatAMPM(new Date(parseInt(categoryData.validity) * 1000));
      this.tradeData["tokenValidity"] = time + " " + timeFormat
      this.tradeData["categoryId"] = parseInt(categoryData.categoryId);

      let descData = await couponInstance._defaultCouponType(categoryData.categoryId);
      this.tradeData["desc"] = descData.desc;
      this.tradeData["percentage"] = descData.perc;
      this.tradeData["tokenId"] = parseInt(tokenId);

      this.createTrade = true;
      this.show = true;
    }
  }

  truncateAddress(address) {
    let start4Digits = address.slice(0, 4);
    let separator = '....';
    let last4Digits = address.slice(-4);
    address = start4Digits.padStart(2, '0') + separator.padStart(2, '0') + last4Digits.padStart(2, '0');
    return address;
  }

  public toDecimal(val, decimal) {
    if (val === undefined || val === null) {
      return;
    }
    val = val.toString();
    val = parseFloat(val);
    return val.toFixed(decimal);
  }

  public countDownTimer(t) {
    let days = Math.floor(t / (1000 * 60 * 60 * 24));
    let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((t % (1000 * 60)) / 1000);
    if (t > 0) {
      this.tradeData['minutes'] = minutes;
      this.tradeData['seconds'] = seconds;
      this.tradeData['days'] = days;
      this.tradeData['hours'] = hours;
      if (this.tradeData['days'].toString().length == 1) {
        this.tradeData['days'] = "0" + this.tradeData['days'];
      }
      if (this.tradeData['hours'].toString().length == 1) {
        this.tradeData['hours'] = "0" + this.tradeData['hours'];
      }
      if (this.tradeData['minutes'].toString().length == 1) {
        this.tradeData['minutes'] = "0" + this.tradeData['minutes'];
      }
      if (this.tradeData['seconds'].toString().length == 1) {
        this.tradeData['seconds'] = "0" + this.tradeData['seconds'];
      }
    }
  }

  async buyNFT() {
    try {
      this.approving = true;
      let tokenInstance = new ethers.Contract(this.tradeData['tokenAddress'], environment.ERC20_Token_Abi, this.provider.getSigner());
      let approve = await tokenInstance.approve(environment.exchangeAddress, this.tradeData["amount"]);
      await this.provider.waitForTransaction(approve.hash);
      await this.provider.waitForTransaction(approve.hash);
      this.approving = false;
      this.buying = true;
      let buyNft = await this.exchangeContractInstance.party2Response(this.exchangeId);
      await this.provider.waitForTransaction(buyNft.hash);
      await this.provider.waitForTransaction(buyNft.hash);
      this.txSuccess = true;
      this.buying = false;
    } catch (e) {
      console.log(e)
      this.approving = false;
      this.buying = false;
    }
  }

  async cancelTrade() {
    try {
      this.cancelling = true;
      let cancelNft = await this.exchangeContractInstance.withdrawRequest(this.exchangeId);
      await this.provider.waitForTransaction(cancelNft.hash);
      await this.provider.waitForTransaction(cancelNft.hash);
      this.cancelling = false;;
      this.txSuccess = true;
    } catch (e) {
      this.cancelling = false;
      console.log(e)
    }
  }

  async createExchange() {
    try {
      let now = new Date().getTime();
      let expiryTime = new Date(this.expiryDate).getTime();
      let time = Math.floor((expiryTime - now) / 1000);
      if (!this.tokenAmount || !this.expiryDate || time <= 0 || this.tokenAmount <= 0) {
        this.error = true;
      } else {
        this.approvingCreate = true;
        let tokenInstance = new ethers.Contract(environment.PlotxCouponAddress, environment.plotxCouponAbi, this.provider.getSigner());
        let approve = await tokenInstance.approve(environment.exchangeAddress, this.tradeData["tokenId"]);
        await this.provider.waitForTransaction(approve.hash);
        await this.provider.waitForTransaction(approve.hash);
        this.approvingCreate = false;
        this.creating = true;
        let create = await this.exchangeContractInstance.createExchange(this.tradeData["tokenId"],
         environment.PlotxCouponAddress, time, environment.ERC20_Token, ethers.utils.parseEther(this.tokenAmount.toString()));
        await this.provider.waitForTransaction(create.hash);
        await this.provider.waitForTransaction(create.hash);
        this.creating = false;
        this.txSuccess = true;
      }
    } catch (e) {
      this.creating = false;
      this.approvingCreate = false;
      console.log(e)
    }
  }

  async topUp() {
    try {
      if (!this.topupAmount || this.topupAmount <= 0) {
        this.errorTopup = true;
      } else {
        this.approveTopUp = true;
        let tokenInstance = new ethers.Contract(environment.ERC20_Token, environment.ERC20_Token_Abi, this.provider.getSigner());
        let approve = await tokenInstance.approve(environment.PlotxCouponAddress, ethers.utils.parseEther(this.topupAmount.toString()));
        await this.provider.waitForTransaction(approve.hash);
        await this.provider.waitForTransaction(approve.hash);
        this.approveTopUp = false;
        this.topup = true;
        let couponInstance = new ethers.Contract(environment.PlotxCouponAddress, environment.plotxCouponAbi, this.provider.getSigner());
        let create = await couponInstance.refillValidity(this.tradeData["tokenId"], ethers.utils.parseEther(this.topupAmount.toString()));
        await this.provider.waitForTransaction(create.hash);
        await this.provider.waitForTransaction(create.hash);
        this.topup = false;
        this.txSuccess = true;
      }
    } catch (e) {
      this.topup = false;
      this.approveTopUp = false;
      console.log(e)
    }
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  async exchangeEventData() {
    // this.provider.resetEventsBlock(0)
    let topic = ethers.utils.id("ExchangeCreated(uint256,address,address,uint256,address,uint256)");
    var iface = new ethers.utils.Interface(environment.exchangeAbi);
    let filter = {
      address: environment.exchangeAddress,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [topic]
    }
    var callPromise = this.provider.getLogs(filter);
    var eventData = callPromise.then(function (events) {
      var parsedEvents = events.map(function (log) {
        let blockNumber = log.blockNumber;
        let decodedLog = iface.parseLog(log)
        let iFaceData = {
          decodedLog,
          blockNumber
        }
        return iFaceData
      });
      return parsedEvents;
    }).catch(function (err) {
      console.log(err);
    });
    return eventData;
  }

  async enableMetamask() {
    await this.web3.enable();
    window.location.reload();
  }

  reload() {
    window.location.reload()
  }

  removeError() {
    this.error = false;
  }

  removeTopupError() {
    this.errorTopup = false;
  }

  validTill() {
    this.validtill = this.toDecimal((this.topupAmount * 100) / 3600, 2) + " hours";
  }
}
