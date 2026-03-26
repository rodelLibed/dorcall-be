import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum CallType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

export enum CallStatus {
  ANSWERED = 'answered',
  MISSED = 'missed',
  FAILED = 'failed',
  BUSY = 'busy'
}

@Table({
  tableName: 'call_logs',
  timestamps: true
})
export default class CallLog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'customer_number'
  })
  customerNumber!: string;

  @Column({
    type: DataType.ENUM('inbound', 'outbound'),
    allowNull: false,
    field: 'call_type'
  })
  callType!: CallType;

  @Column({
    type: DataType.ENUM('answered', 'missed', 'failed', 'busy'),
    allowNull: false,
    field: 'call_status'
  })
  callStatus!: CallStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'answer_time'
  })
  answerTime!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'end_time'
  })
  endTime!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  duration!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'sip_extension'
  })
  sipExtension!: string;

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
