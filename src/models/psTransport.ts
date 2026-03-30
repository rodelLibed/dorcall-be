import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'psTransports',
  timestamps: true,
})
export default class PsTransport extends Model {
  @Column({
    type: DataType.STRING(40),
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  async_operations!: number;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  bind!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  cert_file!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  cipher!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  domain!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  external_media_address!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  external_signaling_address!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  external_signaling_port!: number;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  method!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  local_net!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  password!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  priv_key_file!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  protocol!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  require_client_cert!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  verify_client!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
  })
  verify_server!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  tos!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  cos!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt!: Date;
}
