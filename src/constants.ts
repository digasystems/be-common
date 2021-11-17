import path from "path";
import fs from "fs";

const constants = {
    privateKEY: fs.readFileSync(path.join(__dirname, './keys/jwtRS256.key'), 'utf8'),
    publicKEY: fs.readFileSync(path.join(__dirname, './keys/jwtRS256.key.pub'), 'utf8')
}

export default constants;