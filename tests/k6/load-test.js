import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const url = 'http://talentai-backend:8080/api/offers';

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'temps de réponse < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}