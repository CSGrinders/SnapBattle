const {ref, deleteObject} = require("firebase/storage");
const storage = require("./Firebase");

async function deleteImageFirebaseUrl(imageUrl) {
    const filePath = imageUrl.split('/o/')[1].split('?')[0];
    const decodedFilePath = decodeURIComponent(filePath);
    const fileRef = ref(storage, decodedFilePath);

    try {
        await deleteObject(fileRef);
        console.log('Firebase image deleted successfully');
    } catch (error) {
        console.error('Error deleting Firebase image:', error);
    }
}
module.exports = {deleteImageFirebaseUrl}