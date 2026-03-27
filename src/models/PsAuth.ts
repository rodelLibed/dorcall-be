import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'psAuths',
  timestamps: true
})
export default class PsAuth extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  id!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  })
  columnId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'auth_type'
  })
  authType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt!: Date;
}
