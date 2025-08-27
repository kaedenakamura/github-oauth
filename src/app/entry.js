'use strict';
import $, { data } from "jquery"
const block =$("#block");
const scalingButton = $("#scaling-button");
const movingButton = $("#moving-button");

scalingButton.on("click", () => {
  block.animate(
    { width: "200pt", height: "200pt" }, 2000,
    () => { // 1つ目のアニメーションが終わったら次を実行
      block.animate({ width: "100pt", height: "100pt" }, 2000);
    }
  );
});

movingButton.on("click", () => {
  block.animate(
    { marginLeft: "500px",}, 2000,
    () => { // 1つ目のアニメーションが終わったら次を実行
      block.animate({ marginLeft: "20px", }, 2000);
    }
  );
});
const loadavg = $("#loadavg");

import io from "socket.io-client";
const socket = io("http://localhost:3000");
socket.on("server-status",(data) => {
  loadavg.text(data.loadavg.toString());
});
socket.on("connect", () => { console.log("切断しました");});
socket.on("disconnect",() => {
  console.log("切断しました");
});


