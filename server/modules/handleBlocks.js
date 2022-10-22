const fs = require("fs/promises");
const BLOCK_DB_PATH = process.env.BLOCK_DB_PATH;

async function isImageBlocked( imagePath ) {
    const blockList = await loadBlockList();

    for( let entry of blockList ) {
        if ( imagePath.includes(entry) ) {
            return true;
        }
    }

    return false;
}

async function loadBlockList() {
    try {
        const data = (await fs.readFile( BLOCK_DB_PATH, { encoding : 'utf8' } )).split('\n');

        return data.map(el => el.trim());
    } catch (error) {
        console.log(error)
        console.log("block db not found");
        return []
    }
}

module.exports = {
    isImageBlocked
} 