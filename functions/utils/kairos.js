const kairosConfig = require("../config");

const { appId, appKey } = require("../config");

const Kairos = require("kairos-api");
const client = new Kairos(appId, appKey);

exports.matchImages = (images, gallery_name) => {
  return Promise.all(images.map(image => client.recognize({ image, gallery_name }))).then(
    matchDocs => {
      const matches = matchDocs.map(doc => doc.body.images);
      return matches.reduce((acc, match, i) => {
        if (match) {
          match.forEach(obj => {
            if (obj.candidates) {
              obj.candidates.forEach(candidate => {
                if (!acc[candidate.subject_id]) {
                  acc[candidate.subject_id] = [images[i]];
                } else if (!acc[candidate.subject_id].includes(images[i]))
                  acc[candidate.subject_id].push(images[i]);
              });
            }
          });
        }

        return acc;
      }, {});
    }
  );
};
