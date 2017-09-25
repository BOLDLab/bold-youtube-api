const config = {
      tokenDir: () => {

          //  if(typeof process.env.GOOGLE_CREDENTIALS === 'undefined') {
                return (process.env.HOME || process.env.HOMEPATH ||
                  process.env.USERPROFILE) + '/.credentials/';
          //  } else {
              //  return './.credentials/';
          //  }
      },
      credentials: () => {
          if(typeof process.env.GOOGLE_CREDENTIALS === 'undefined') {
              return false;
          }

          return JSON.parse(process.env.GOOGLE_CREDENTIALS);
      },
      origins: ["https://uonline.newcastle.edu.au",
                          "https://bold.newcastle.edu.au",
                                  "https://bold-space.newcastle.edu.au"]
};

module.exports = config;
