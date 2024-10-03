import countryOptions from "../../thetruenest_client/src/data/countryOptions";

function getCountryCodeFromName(countryName) {
  let countryCode = "";
  countryOptions.map((item) => {
    if (item.name == countryName) {
      countryCode = item.code;
    }
  });
  return countryCode;
}

export default getCountryCodeFromName;
