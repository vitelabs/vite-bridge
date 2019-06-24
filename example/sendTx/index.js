import Bridge from "@vite/bridge";
import { abi, utils, constant } from "@vite/vitejs";

const { Snapshot_Gid, Vote_Addr, Vote_Abi } = constant;
const nodeName = "DreamFund";
const sendViteAddr = "vite_c7120abaf4cd14688b7d70c45fdd46cf6e27bd36535eb0c321";

const bridge = new Bridge();

const handleCallContract = () => {
  const inputNodeName =
    $("#vote_input")
      .val()
      .trim() || nodeName;
  const hexData = abi.encodeFunctionCall(
    [Vote_Abi],
    [Snapshot_Gid, inputNodeName],
    "Vote"
  );
  const base64Data = utils._Buffer.from(hexData, "hex").toString("base64");
  const p=bridge["wallet.currentAddress"]()
    .then(addr => {
      bridge["wallet.sendTxByURI"]({
        address: addr,
        uri: utils.uriStringify({
          target_address: Vote_Addr,
          function_name: "Vote",
          params: { data: base64Data }
        })
      }).then(accountBlock => {
        toast("投票成功");
      });
    })
    .catch(e => toast(`投票失败,${e.message || JSON.stringify(e)}`));
};

const handleSendTx = () => {
  const input = $("#send_input")
    .val()
    .trim();
  bridge["wallet.currentAddress"]().then(addr => {
    bridge["wallet.sendTxByURI"]({
      address: addr,
      uri: utils.uriStringify({
        target_address: sendViteAddr,
        params: { amount: 1 }
      })
    })
      .then(accountBlock => {
        toast("发送成功");
      })
      .catch(e => toast(`发送失败,${e.message || JSON.stringify(e)}`));
  });
};

function toast(s) {
  $("#tips")
    .text(s)
    .show();
  setTimeout(() => {
    $("#tips").hide();
  }, 2000);
}

$("#vote_button").click(handleCallContract);
$("#send_button").click(handleSendTx);
