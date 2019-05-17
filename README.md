# Optimistic locking example in Sequelize

## Cautions

- Bulk update / put methods do not update versions because it does not fetch existing ones first.
