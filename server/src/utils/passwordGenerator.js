// Password
export const RandomPasswordGenLength = 12
export const RandomPasswordCharSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$%^^&*(){}[]#?/><"

export function generateRandomPassword() {
    const length = RandomPasswordGenLength;
    const charset = RandomPasswordCharSet;
    let password = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }
