import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'psAors',
  timestamps: true
})
export default class PsAor extends Model {
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
    field: 'max_contacts'
  })
  maxContacts!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt!: Date;
}
