import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from "../../../../../environments/environment";

import Web3 from 'web3';
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
  public url = environment.url;
  // public connectWallet;
  public getWeb3Metamask
  constructor() {

  }

  ngOnInit(){
    (async () => {
      if (this.web3 == undefined) {
        $('#modal-metamaskCheck').modal('show');
        this.metamaskNotPresent = true;
      }else{
        try {
                console.log("njfevev")
               await this.web3.enable();
               this.displayInfo()
              }
              catch (err) {
                console.log(err)
              }
      }
    })();   

      

  }

  ngAfterViewInit(): void {

  }
  displayInfo(){
    if (this.web3 != undefined) {
      if (this.web3.selectedAddress != null) {
        this.provider = new ethers.providers.Web3Provider(this.web3);
        new ethers.providers.Web3Provider(this.web3).getNetwork().then(network => {
          this.setNetwork(network.name)
        });
        var metamaskAddress = this.web3.selectedAddress;
        this.trucateAddress(metamaskAddress);
      }
      else {
        this.provider = new ethers.providers.JsonRpcProvider(this.url);
        this.metaLoggedOff = true;
      }
    } 
    else {
      this.provider = new ethers.providers.JsonRpcProvider(this.url);
      this.metaLoggedOff = true;
    }
  }
  setNetwork(network) {
    this.provider = network;
    console.log(this.provider)
    if (this.provider != "kovan") {
      this.wrongNetwork = true;
      $('#modal-metamaskCheck').modal('show');
    }
  }
  trucateAddress(metamaskAddress) {
    this.metamaskAddress = metamaskAddress;
    const start4Digits = this.metamaskAddress.slice(0, 6);
    const separator = '....';
    const last4Digits = this.metamaskAddress.slice(-4);
    this.metamaskAddress = start4Digits.padStart(2, '0') + separator.padStart(2, '0') + last4Digits.padStart(2, '0');
  }

}
