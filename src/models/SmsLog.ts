import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

@Table({
  tableName: 'sms_logs',
  timestamps: true
})
export default class SmsLog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'agents_id'
  })
  agentsId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'phone_number'
  })
  phoneNumber!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  message!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'message_type'
  })
  messageType!: string;

  @Column({
    type: DataType.ENUM('sent', 'delivered', 'failed'),
    allowNull: false,
    defaultValue: 'sent',
    field: 'delivery_status'
  })
  deliveryStatus!: DeliveryStatus;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt!: Date;
}
