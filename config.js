const config = {
      credentials: () => {
          if(process.env.NODE_DEV) {
              return (process.env.HOME || process.env.HOMEPATH ||
                  process.env.USERPROFILE) + '/.credentials/';
          } else {
              return JSON.parse(process.env.CREDENTIALS);
          }
      }
};
