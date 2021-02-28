import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from "../../../../../environments/environment";

import Web3 from 'web3';
import { ConditionalExpr } from '@angular/compiler';
declare var $: any;
@Component({
  selector: '.wrapper',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, AfterViewInit {
  public web3 = window['ethereum'];
  public wrongNetwork;
  public metamaskAddress;
  public metamaskNotPresent;
  public metaLoggedOff;
  public provider;
  public tradeData = [];
  public exchangeContractInstance;
  public tokenData = [];
  public show = false;
  constructor() {

  }

  ngOnInit() {
    if (this.web3 != undefined) {
      if (this.web3.selectedAddress != null) {
        this.metamaskAddress = this.web3.selectedAddress;
        this.provider = new ethers.providers.Web3Provider(this.web3);
        this.provider.getNetwork().then(network => {
          if (network.chainId != 42) {
            this.wrongNetwork = true;
            $("#modal-metamaskCheck").modal("show");
          } else {
            this.exchangeContractInstance = new ethers.Contract(environment.exchangeAddress, environment.exchangeAbi, this.provider.getSigner());
            this.availableTradeData();
          }
        });
      } else {
        $("#modal-metamaskCheck").modal("show");
      }
    } else {
      this.metamaskNotPresent = true;
      $("#modal-metamaskCheck").modal("show");
    }
  }

  ngAfterViewInit(): void {
    if (this.web3 != undefined) {
      window['ethereum'].on('accountsChanged', () => {
        window.location.reload();
      });

      window['ethereum'].on('networkChanged', () => {
        window.location.reload();
      });
    }
  }

  trucateAddress(metamaskAddress) {
    this.metamaskAddress = metamaskAddress;
    const start4Digits = this.metamaskAddress.slice(0, 6);
    const separator = '....';
    const last4Digits = this.metamaskAddress.slice(-4);
    this.metamaskAddress = start4Digits.padStart(2, '0') + separator.padStart(2, '0') + last4Digits.padStart(2, '0');
    if (this.metamaskAddress == null) {
      window.location.reload()
    }
  }
  reload() {
    window.location.reload()
  }

  async availableTradeData() {
    let couponInstance = new ethers.Contract(environment.PlotxCouponAddress, environment.plotxCouponAbi, this.provider);
    let tokenSupply = await couponInstance.tokenSupply()
    for (let i = 1; i <= parseInt(tokenSupply); i++) {
      let ownerAddress = await couponInstance.ownerOf(i);
      if (ownerAddress.toLowerCase() == this.web3.selectedAddress.toLowerCase()) {
        let category = await couponInstance.couponCategory(i)
        let categoryId = parseInt(category.categoryId);
        let categorydata = await couponInstance._defaultCouponType(category.categoryId);
        let validity = parseInt(category.validity);
        let standardTime = new Date(validity * 1000);
        let time = standardTime.toString().substr(4, 12);
        let timeFormat = this.formatAMPM(new Date(validity * 1000));
        console.log(time,timeFormat)
        let data = {
          tokenId: i,
          tokenName: categorydata.name + " [" + i + "]",
          categoryId: categoryId,
          desc : categorydata.desc,
          validity : time+" "+timeFormat
        }
        this.tokenData.push(data)
      }
    }
    console.log(this.tokenData)
    this.show = true;
  }

  async enableMetamask() {
    await this.web3.enable();
    window.location.reload();
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
}

