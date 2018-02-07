const MemoryConnector = require('loopback-datasource-juggler/lib/connectors/memory');
const bson = require('bson');
const g = require('strong-globalize')();

function serialize(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    return JSON.stringify(obj);
}
function getNewObjectId() {
    return new bson.ObjectID().toHexString();
}

const Memory = MemoryConnector.Memory;
Memory.prototype.getDefaultIdType = function() {
    return String;
};

Memory.prototype.idName = function() {
    return 'id';
};

// These are same as the built-in one except we want to generate ObjectId string for id
Memory.prototype.initCollection = function(model) {
    this.collection(model, {});
    this.collectionSeq(model, getNewObjectId());
};
Memory.prototype._createSync = function(model, data, fn) {
    // FIXME: [rfeng] We need to generate unique ids based on the id type
    // FIXME: [rfeng] We don't support composite ids yet
    let currentId = this.collectionSeq(model);
    if (currentId === undefined) { // First time
        currentId = this.collectionSeq(model, getNewObjectId());
    }
    let id = this.getIdValue(model, data) || currentId;
    if (id > currentId) {
      // If the id is passed in and the value is greater than the current id
        currentId = id;
    }
    this.collectionSeq(model, getNewObjectId());

    const props = this._models[model].properties;
    const idName = this.idName(model);
    id = (props[idName] && props[idName].type && props[idName].type(id)) || id;
    this.setIdValue(model, data, id);
    if (!this.collection(model)) {
        this.collection(model, {});
    }

    if (this.collection(model)[id]) {
        const error = new Error(g.f('Duplicate entry for %s.%s', model, idName));
        error.statusCode = error.status = 409;
        return fn(error);
    }

    this.collection(model)[id] = serialize(data);
    fn(null, id);
};

module.exports = MemoryConnector;
