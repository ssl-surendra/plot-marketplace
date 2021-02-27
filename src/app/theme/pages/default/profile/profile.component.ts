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
    if(this.web3.selectedAddress== null){
      if(this.metamaskAddress==undefined){
        $('#modal-metamaskCheck').modal('show');
        this.metaLoggedOff=true
      }    
    }else{
      this.displayInfo()
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
  public async connectWallet() {
    if (this.web3 == undefined) {
      $('#modal-metamaskCheck').modal('show');
      this.metamaskNotPresent = true;
    }
    else {
      try {
        await this.web3.enable();
        this.displayInfo()
      }
      catch (err) {
        console.log(err)
      }
    }
  }
  // (async () => {
  //   if (this.web3 == undefined) {
  //     $('#modal-metamaskCheck').modal('show');
  //     this.metamaskNotPresent = true;
  //   }else{
  //     try {
  //             console.log("njfevev")
  //            await this.web3.enable();
  //            this.displayInfo()
  //           }
  //           catch (err) {
  //             console.log(err)
  //           }
  //   }
  // })(); 
  displayInfo(){
    this.metaLoggedOff=false
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
  async myNFT(){    
    // let nftDetails = await this.exchangeContractInstance
    // let exchangeLength = await this.exchangeContractInstance.getCountExchange()
    // exchangeLength = parseInt(exchangeLength["_hex"])
    // console.log(exchangeLength)
    // for (let i = 0; i < exchangeLength.length; i++) {
    // let nftDetails = await this.exchangeContractInstance.exchange(exchangeId);
    // }
    // let data = await this.exchangeEventData();
    // for (let i = 0; i < data.length; i++) {
      // let exchangeId = parseInt(data[i].decodedLog.args._exchangeID);
      let exchangeLength = await this.exchangeContractInstance.getCountExchange();
      exchangeLength = parseInt(exchangeLength["_hex"])
      console.log(exchangeLength)
      let nftDetails = await this.exchangeContractInstance.exchange(0);
      console.log(nftDetails)
      let nftDetails1 = await this.exchangeContractInstance.exchange(1);
      console.log(nftDetails1)
      let nftDetails2 = await this.exchangeContractInstance.exchange(2);
      console.log(nftDetails2)
      let nftDetails3 = await this.exchangeContractInstance.exchange(2);
      console.log(nftDetails3)
      console.log("hiii")
    // }
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

}
