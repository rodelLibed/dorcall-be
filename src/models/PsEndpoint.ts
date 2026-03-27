import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'psEndpoints',
  timestamps: true
})
export default class PsEndpoint extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
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
    allowNull: false
  })
  transport!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  context!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  disallow!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  allow!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  auth!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  aors!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt!: Date;
}
