const config = {
      tokenPath: () => {
        return (process.env.HOME || process.env.HOMEPATH ||
            process.env.USERPROFILE) + '.credentials/';
      },
      credentials: () => {
          return JSON.parse(process.env.GOOGLE_CREDENTIALS);
      }
};
