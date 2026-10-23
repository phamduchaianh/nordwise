export function parseRentData (data){
    if (!data || !data.dimension || !data.value) {
        console.warn("Data is empty");      //error handling
        return new Map();
    };
}