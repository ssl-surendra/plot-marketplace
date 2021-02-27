import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from "../../../../../environments/environment"
import { ethers } from 'ethers';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Router } from "@angular/router";
@Component({
  selector: '.wrapper',
  templateUrl: './asset.component.html',
})
export class AssetComponent implements OnInit, AfterViewInit {
  public web3 = window['ethereum'];
  public provider;
  public tradeData = { "partyAddress": null, "nftTokenAddress": null, 'exchangeId': null, "expiry": null, "tokenAddress": null, "tokenName": null, "tokenAmount": null, "days": null, "hours": null, "minutes": null, "seconds": null };
  public exchangeContractInstance;
  public $counter: Observable<number>;
  public subscription: Subscription;
  public exchangeId;
  public createTrade = false;
  public txSuccess = false;
  constructor(private router: Router) {

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

  async availableTradeData() {
    this.exchangeId = this.router.url.split('/')[2];
    let nftDetails = await this.exchangeContractInstance.exchange(this.exchangeId);
    if (nftDetails.status == 0) {
      let tokenInstance = new ethers.Contract(nftDetails.token2, environment.ERC20_Token_Abi, this.provider);
      let tokenName = await tokenInstance.name()
      this.tradeData["partyAddress"] = this.truncateAddress(nftDetails.party1);
      this.tradeData["nftTokenAddress"] = this.truncateAddress(nftDetails.token1);
      this.tradeData["exchangeId"] = parseInt(nftDetails.tokenID);
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
      let tokenInstance = new ethers.Contract(this.tradeData['tokenAddress'], environment.ERC20_Token_Abi, this.provider);
      let approve = await tokenInstance.approve(environment.exchangeAddress, this.tradeData["amount"]);
      await this.provider.waitForTransaction(approve.hash);
      await this.provider.waitForTransaction(approve.hash);
      let buyNft = await this.exchangeContractInstance.party2Response(this.tradeData["exchangeId"]);
      await this.provider.waitForTransaction(buyNft.hash);
      await this.provider.waitForTransaction(buyNft.hash);
      this.txSuccess = true;
    } catch (e) {
      console.log(e)
    }
  }

  async cancelTrade() {
    try {
      let buyNft = await this.exchangeContractInstance.withdrawRequest(this.tradeData["exchangeId"]);
      await this.provider.waitForTransaction(buyNft.hash);
      await this.provider.waitForTransaction(buyNft.hash);
      this.txSuccess = true;
    } catch (e) {
      console.log(e)
    }
  }
}
