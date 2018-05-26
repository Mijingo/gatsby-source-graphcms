'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodes = exports.assembleQueries = exports.constructTypeQuery = exports.surroundWithBraces = exports.extractTypeName = exports.formatTypeName = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _ramda = require('ramda');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// If type ends in a non-vowel, we need to append es. Else s.
// TODO: Use an actual pluralize library for this. This doesn't cover all use cases.
const formatTypeName = exports.formatTypeName = t => `all${t}${t.endsWith(`s`) ? `es` : `s`}`;

// Get the type name back from a formatted type name.
// TODO: Use the same pluralize to convert from plural to singular?
const extractTypeName = exports.extractTypeName = t => /all(.+(?:s|es))/gi.exec(t);

// Create the query body
const surroundWithBraces = exports.surroundWithBraces = c => `{${c}}`;

// Constructs a query for a given type.
const constructTypeQuery = exports.constructTypeQuery = type => `
  ${formatTypeName(type.name)} {
    ${(0, _ramda.compose)((0, _ramda.join)(`\n`), (0, _ramda.pluck)(`name`))(type.fields)}
  }
`;

// Composition which assembles the query to fetch all data.
const assembleQueries = exports.assembleQueries = (0, _ramda.compose)(surroundWithBraces, (0, _ramda.join)(`\n`), (0, _ramda.map)(constructTypeQuery), (0, _ramda.path)([`__type`, `possibleTypes`]));

const createNodes = (createNode, reporter) => (value, key) => {
  (0, _ramda.forEach)(queryResultNode => {
    const { id } = queryResultNode,
          fields = _objectWithoutProperties(queryResultNode, ['id']);
    queryResultNode.id = queryResultNode.id + '';
    const jsonNode = JSON.stringify(queryResultNode);
    // jsonNode.id = jsonNode.id + '';
    console.log(jsonNode);
    const gatsbyNode = _extends({
      id
    }, fields, {
      parent: `${_constants.SOURCE_NAME}_${key}`,
      children: [],
      internal: {
        type: 'string',
        content: jsonNode,
        contentDigest: _crypto2.default.createHash(`md5`).update(jsonNode).digest(`hex`)
      }
    });
    gatsbyNode.id = gatsbyNode.id + '';

    if (_constants.DEBUG_MODE) {
      const jsonFields = JSON.stringify(fields);
      const jsonGatsbyNode = JSON.stringify(gatsbyNode);
      reporter.info(`  processing node: ${jsonNode}`);
      reporter.info(`    node id ${id}`);
      reporter.info(`    node fields: ${jsonFields}`);
      reporter.info(`    gatsby node: ${jsonGatsbyNode}`);
    }

    createNode(gatsbyNode);
  }, value);
};
exports.createNodes = createNodes;
