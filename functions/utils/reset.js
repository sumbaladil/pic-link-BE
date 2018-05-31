const kairosConfig = require("../config");

const { appId, appKey } = require("../config");

const Kairos = require("kairos-api");
const client = new Kairos(appId, appKey);

client
  .galleryRemove({
    gallery_name: "E1aNQMQClBprgRoa67kh"
  })
  .then(res => console.log(res));

//client.galleryListAll().then(console.log);
