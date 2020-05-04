import { log } from "@graphprotocol/graph-ts";
import { InterfaceImplementerSet } from "../generated/ERC1820/ERC1820";
import { Token, Total } from "../generated/schema";
import { ERC777 as ERC777Contract } from "../generated/ERC1820/ERC777";

const invalidContracts: Array<string> = ["0x29a61bb008e7de335963bb88cd492a0e55146899", "0x96dbd2a48a8f08f114bf4597166c1909d939bdee"];

export function handleInterfaceImplementerSet(
  event: InterfaceImplementerSet
): void {
  if (
    event.params.interfaceHash.toHexString() ==
    "0xac7fbab5f54a3ca8194167523c6753bfeb96a445279294b6125b68cce2177054"
  ) {
    let erc777 = new Token(event.params.addr.toHexString());
    erc777.implementer = event.params.implementer;
    let contract = ERC777Contract.bind(event.params.implementer);
    erc777.totalSupply = contract.totalSupply();

    if (!invalidContracts.includes(event.params.implementer.toHexString())) {
      let name = contract.try_name();
      if (name.reverted) {
        log.info(`${event.params.addr.toHexString()} name reverted`, []);
      } else {
        erc777.name = name.value;
      }

      let symbol = contract.try_symbol();
      if (symbol.reverted) {
        log.info(`${event.params.addr.toHexString()} symbol reverted`, []);
      } else {
        erc777.symbol = symbol.value;
      }
    }

    erc777.save();

    let total = Total.load("1");
    if (total == null) {
      total = new Total("1");
      total.count = 0;
    }
    total.count = total.count + 1;
    total.save();
  }
}
