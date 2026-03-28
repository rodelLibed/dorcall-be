interface AmiConfig {
  host: string;
  port: number;
  username: string;
  secret: string;
}

const config: AmiConfig = {
  host: '127.0.0.1',
  port: 5038,
  username: 'node_admin',
  secret: '12345678',
};

export default config;
