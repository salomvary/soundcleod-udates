const http = require("http");
const Hazel = require("hazel-server");
const Router = require("router");
const { valid, lt } = require("semver");
const { send } = require("micro");
const checkAlias = require("hazel-server/lib/aliases");

const v130 = require("./v130.json");

const PORT = process.env.PORT || 5000;

const hazel = Hazel({
  account: "salomvary",
  repository: "soundcleod",
});

const router = Router();

/**
 * Due to replaced code signing certificates everyone with older versions
 * than a pivot version has to upgrade to it and upgrade to the latest from here.
 * Original idea from here:
 * https://github.com/Squirrel/Squirrel.Mac/issues/160#issuecomment-171545819
 * TODO: support Windows too (?)
 */
const pivot = (pivotVersion, response) =>
  router.get("/update/:platform/:version", (req, res, next) => {
    const { platform: platformName, version } = req.params;
    const normalizedPlatform = checkAlias(platformName);

    if (
      normalizedPlatform == "darwin" &&
      valid(version) &&
      lt(version, pivotVersion)
    ) {
      send(res, 200, response);

      return;
    } else {
      next("router");
    }
  });

pivot("1.3.0", v130);

http
  .createServer((req, res) => {
    router(req, res, () => hazel(req, res));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
