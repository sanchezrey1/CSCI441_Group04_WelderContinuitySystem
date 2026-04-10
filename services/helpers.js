import { getTokenPayload } from "./api"


export function isLoggedIn() {
    const p = getTokenPayload()
        
          if(!p) {
              return null;
          }
                   
          return p;
}