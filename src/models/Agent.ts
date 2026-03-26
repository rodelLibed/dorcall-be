import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'agents',
  timestamps: true
})
export default class Agent extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'full_name'
  })
  fullName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'offline'
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'sip_extension'
  })
  sipExtension!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'sip_password'
  })
  sipPassword!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'sip_domain'
  })
  sipDomain!: string;

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
