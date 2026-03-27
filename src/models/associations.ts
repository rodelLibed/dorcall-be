import PsAuth from './PsAuth';
import PsAor from './PsAor';
import PsEndpoint from './PsEndpoint';

export const setupAssociations = () => {
  // =============================================
  // PsAuth (psAuths) -> PsEndpoint (psEndpoints)
  // psAuths.id  →  psEndpoints.auth
  // =============================================
  PsAuth.hasOne(PsEndpoint, {
    foreignKey: 'auth',   // column in psEndpoints
    sourceKey: 'id',      // column in psAuths
    as: 'endpoint'
  });

  PsEndpoint.belongsTo(PsAuth, {
    foreignKey: 'auth',   // column in psEndpoints
    targetKey: 'id',      // column in psAuths
    as: 'psAuth'
  });

  // =============================================
  // PsAor (psAors) -> PsEndpoint (psEndpoints)
  // psAors.id  →  psEndpoints.aors
  // =============================================
  PsAor.hasOne(PsEndpoint, {
    foreignKey: 'aors',   // column in psEndpoints
    sourceKey: 'id',      // column in psAors
    as: 'endpoint'
  });

  PsEndpoint.belongsTo(PsAor, {
    foreignKey: 'aors',   // column in psEndpoints
    targetKey: 'id',      // column in psAors
    as: 'psAor'
  });
};
