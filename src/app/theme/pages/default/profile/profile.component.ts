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
  public tradeData = [];
  public exchangeContractInstance;
  // public connectWallet;
  public getWeb3Metamask
  constructor() {

  }

  ngOnInit(){
    // console.log(this.web3.selectedAddress)
    // if(this.metamaskAddress)
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
    if (this.web3 != undefined) {
      window['ethereum'].on('accountsChanged', () => {
        window.location.reload();
      });

      window['ethereum'].on('networkChanged', () => {
        window.location.reload();
      });
    }
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
        this.contract()
      }
      else {
        this.provider = new ethers.providers.WebSocketProvider(environment.jsonRpcUrl);
        this.metaLoggedOff = true;
      }
    } 
    else {
      this.provider = new ethers.providers.WebSocketProvider(environment.jsonRpcUrl);
      this.metaLoggedOff = true;
    }
  }

  contract(){
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
    this.myNFT();
  }

  async myNFT(){    
      let nftDetails = await this.exchangeContractInstance
      console.log(nftDetails)
   
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
    if(this.metamaskAddress==null){
      window.location.reload()
    }
  }
  
 
  reload() {
    window.location.reload()
  }

}
