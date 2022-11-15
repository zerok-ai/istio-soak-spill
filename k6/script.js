import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      duration: '30s',
      rate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 2,
      maxVUs: 50,
    },
  },
};

function getColor(status) {
  switch(status){
    case 200: return "\x1b[32m"; break;
    case 429: return "\x1b[33m"; break;
    default: return "\x1b[31m";
  }
}

export default function () {
  const res = http.get('http://127.0.0.1:55350/');
  console.log(res.headers['x-envoy-ratelimited']+"["+getColor(res.status)+res.status+"\x1b[0m]", res.headers['Zerok-Target'].split(',').map((x)=>x.trim()).reverse().join(', '))
  check(res, { 
    'status was 200': (r) => r.status == 200,
    'status was 429': (r) => r.status == 429,
    'soak': (r) => r.headers['Zerok-Target'].includes('soak'),
    'spill': (r) => r.headers['Zerok-Target'].includes('spill'),
    'soak-rate-limited': (r) => r.headers['Zerok-Target'].includes('soak-rate-limited')
  });
  sleep(1);
}

