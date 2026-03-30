import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'psEndpoints',
  timestamps: true,
})
export default class PsEndpoint extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  columnId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  transport!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  context!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  disallow!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  allow!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  auth!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  aors!: string;

  // WebRTC-specific columns
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  webrtc!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  ice_support!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  rtcp_mux!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  media_encryption!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  dtls_auto_generate_cert!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  dtls_verify!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'actpass',
  })
  dtls_setup!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'yes',
  })
  rewrite_contact!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'yes',
  })
  force_rport!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'yes',
  })
  rtp_symmetric!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'no',
  })
  direct_media!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'yes',
  })
  media_use_received_transport!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt!: Date;
}
