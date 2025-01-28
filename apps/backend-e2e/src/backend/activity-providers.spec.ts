import axios from 'axios';

describe('GET /activity-providers', () => {
  it('should return an array', async () => {
    const res = await axios.get(`/activity-providers`);

    expect(res.status).toBe(200);
  });
});
