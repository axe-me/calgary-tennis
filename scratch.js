import { courts } from './src/data/courts.js';
const typeFilters = ['tennis'];
let result = courts;
const showTennis = typeFilters.includes('tennis');
const showPickleball = typeFilters.includes('pickleball');
if (showTennis && !showPickleball) {
  result = result.filter(c => !c.pickleballOnly);
}
console.log(result.find(c => c.name === 'Walgrove Park'));
