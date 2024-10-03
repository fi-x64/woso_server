import countryOptions from "../../thetruenest_client/src/data/countryOptions";

function getCountryNameFromCode(countryCode) {
  let countryName = "";
  countryOptions.map((item) => {
    if (item.code == countryCode) {
      countryName = item.name;
    }
  });
  return countryName;
}

export default getCountryNameFromCode;
