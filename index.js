const http = require("http");
const Hazel = require("hazel-server");
const Router = require("router");
const { valid, lt } = require("semver");
const { send } = require("micro");
const checkAlias = require("hazel-server/lib/aliases");

const v130 = require("./v130.json");
const pivotVersions = [{ version: "1.3.0", response: v130 }];

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
router.get("/update/:platform/:version", (req, res, next) => {
  const { platform: platformParam, version } = req.params;

  /**
   * SoundCleod's update URL contains the architecture in the platform string
   * which is not supported by Hazel. Rewrite the request URL by removing the
   * architecture as SoundCleod was never released for more multiple architectures
   * on any platform.
   */
  const [platform, arch] = platformParam.split("_");
  const search = new URL(req.url, "http://localhost").search;
  const newUrl = `/update/${platform}/${req.params.version}${search}`;
  req.url = newUrl;

  if (checkAlias(platform) == "darwin" && valid(version)) {
    for (let pivotVersion of pivotVersions) {
      if (lt(version, pivotVersion.version)) {
        send(res, 200, pivotVersion.response);
        return;
      }
    }
  }

  next("router");
});

http
  .createServer((req, res) => {
    router(req, res, () => hazel(req, res));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
