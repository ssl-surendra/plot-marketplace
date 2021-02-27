import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { environment } from "../../../../../environments/environment"
import { ethers } from 'ethers';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { map } from 'rxjs/operators'
@Component({
  selector: '.wrapper',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, AfterViewInit {
  public web3 = window['ethereum'];
  public provider;
  public tradeData = [];
  public exchangeContractInstance;
  public $counter: Observable<number>;
  public subscription: Subscription;
  constructor() {

  }

  ngOnInit(): void {
    if (this.web3 != undefined) {
      if (this.web3.selectedAddress != null) {
        this.provider = new ethers.providers.Web3Provider(this.web3);
        this.exchangeContractInstance = new ethers.Contract(environment.exchangeAddress, environment.exchangeAbi, this.provider);
      } else {
        this.provider = new ethers.providers.WebSocketProvider(environment.jsonRpcUrl);
        this.exchangeContractInstance = new ethers.Contract(environment.exchangeAddress, environment.exchangeAbi, this.provider);
      }
    } else {
      this.provider = new ethers.providers.WebSocketProvider(environment.jsonRpcUrl);
      this.exchangeContractInstance = new ethers.Contract(environment.exchangeAddress, environment.exchangeAbi, this.provider);
    }
    this.availableTradeData();
  }

  ngAfterViewInit(): void {

  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  async availableTradeData() {
    let data = await this.exchangeEventData();
    for (let i = 0; i < data.length; i++) {
      let exchangeId = parseInt(data[i].decodedLog.args._exchangeID);
      let nftDetails = await this.exchangeContractInstance.exchange(exchangeId);
      console.log(nftDetails)
      if (nftDetails.status == 0) {
        let tokenInstance = new ethers.Contract(nftDetails.token2, environment.ERC20_Token_Abi, this.provider);
        let tokenName = await tokenInstance.name()
        let availableTradeData = {
          partyAddress: this.truncateAddress(nftDetails.party1),
          nftTokenAddress: nftDetails.token1,
          exchangeId: parseInt(nftDetails.tokenID),
          expiry: parseInt(nftDetails.expiry),
          tokenAddress : nftDetails.token2,
          tokenName : tokenName,
          tokenAmount: this.toDecimal(parseFloat(ethers.utils.formatEther(nftDetails.amount2OrTokenID)), 2)
        }
        this.tradeData.push(availableTradeData)
        let t = 0;
        this.$counter = interval(1000).pipe(map((x) => {
          let deadline = availableTradeData.expiry * 1000;
          let now = new Date().getTime();
          t = (deadline) - now;
          return x;
        }));
        if (t >= 0) {
          this.subscription = this.$counter.subscribe((x) => this.countDownTimer(i, +t));
        }
      }
    }
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

  public countDownTimer(i, t) {
    let days = Math.floor(t / (1000 * 60 * 60 * 24));
    let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((t % (1000 * 60)) / 1000);
    if (t > 0) {
      this.tradeData[i]['minutes'] = minutes;
      this.tradeData[i]['seconds'] = seconds;
      this.tradeData[i]['days'] = days;
      this.tradeData[i]['hours'] = hours;
      if (this.tradeData[i]['days'].toString().length == 1) {
        this.tradeData[i]['days'] = "0" + this.tradeData[i]['days'];
      }
      if (this.tradeData[i]['hours'].toString().length == 1) {
        this.tradeData[i]['hours'] = "0" + this.tradeData[i]['hours'];
      }
      if (this.tradeData[i]['minutes'].toString().length == 1) {
        this.tradeData[i]['minutes'] = "0" + this.tradeData[i]['minutes'];
      }
      if (this.tradeData[i]['seconds'].toString().length == 1) {
        this.tradeData[i]['seconds'] = "0" + this.tradeData[i]['seconds'];
      }
    }
  }
}
