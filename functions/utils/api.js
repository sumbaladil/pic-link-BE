const kairosConfig = require("../config");

const { appId, appKey } = require("../config");

const Kairos = require("kairos-api");
const client = new Kairos(appId, appKey);

exports.matchImages = (images, gallery_name) => {
  return Promise.all(images.map(image => client.recognize({ image, gallery_name }))).then(
    matchDocs => {
      const matches = matchDocs.map(doc => doc.body.images);
      const res = {};
      console.log("matches: ", matches);
      matches.forEach((match, i) => {
        match.forEach(obj => {
          if (obj.candidates) {
            obj.candidates.forEach(candidate => {
              if (!res[candidate.subject_id]) {
                res[candidate.subject_id] = [images[i]];
              } else res[candidate.subject_id].push(images[i]);
            });
          }
        });
      });

      return res;
    }
  );
};
