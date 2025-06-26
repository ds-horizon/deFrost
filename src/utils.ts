var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider'); // TODO: Delete with enableRenderableContext

var REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference');

function getWrappedName$1(outerType: any, innerType: any, wrapperName: any) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== ''
    ? wrapperName + '(' + functionName + ')'
    : wrapperName;
}
function getContextName$1(type: any) {
  return type.displayName || 'Context';
}
function getComponentNameFromType(type: any): any {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  if (typeof type === 'function') {
    if (type.$$typeof === REACT_CLIENT_REFERENCE) {
      // TODO: Create a convention for naming client references with debug info.
      return null;
    }

    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';
  }

  if (typeof type === 'object') {
    {
      if (typeof type.tag === 'number') {
      }
    }

    switch (type.$$typeof) {
      case REACT_PROVIDER_TYPE: {
        var provider = type;
        return getContextName$1(provider._context) + '.Provider';
      }

      case REACT_CONTEXT_TYPE:
        var context = type;

        {
          return getContextName$1(context) + '.Consumer';
        }

      case REACT_CONSUMER_TYPE: {
        return null;
      }

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName$1(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE: {
        var lazyComponent = type;
        var payload = lazyComponent._payload;
        var init = lazyComponent._init;

        try {
          return getComponentNameFromType(init(payload));
        } catch (x) {
          return null;
        }
      }
    }
  }

  return null;
}
export function getComponentNameFromFiber(fiber: any) {
  try {
    var type = fiber.type;
    switch (fiber.tag) {
      case 24:
        return 'Cache';
      case 9:
        return (type._context?.displayName || 'Context') + '.Consumer';
      case 10:
        return (type.displayName || 'Context') + '.Provider';
      case 18:
        return 'DehydratedFragment';
      case 11:
        return (
          (fiber = type.render),
          (fiber = fiber.displayName || fiber.name || ''),
          type.displayName ||
            (fiber !== '' ? 'ForwardRef(' + fiber + ')' : 'ForwardRef')
        );
      case 7:
        return 'Fragment';
      case 26:
      case 27:
      case 5:
        return type;
      case 4:
        return 'Portal';
      case 3:
        return 'Root';
      case 6:
        return 'Text';
      case 16:
        return getComponentNameFromType(type);
      case 8:
        return type === REACT_STRICT_MODE_TYPE ? 'StrictMode' : 'Mode';
      case 22:
        return 'Offscreen';
      case 12:
        return 'Profiler';
      case 21:
        return 'Scope';
      case 13:
        return 'Suspense';
      case 19:
        return 'SuspenseList';
      case 25:
        return 'TracingMarker';
      case 17:
      case 28:
      case 1:
      case 0:
      case 14:
      case 15:
        if (typeof type === 'function')
          return type.displayName || type.name || null;
        if (typeof type === 'string') return type;
        break;
      case 29:
        type = fiber._debugInfo;
        if (type != null)
          for (var i = type.length - 1; i >= 0; i--)
            if (typeof type[i].name === 'string') return type[i].name;
        if (fiber.return !== null)
          return getComponentNameFromFiber(fiber.return);
    }
  } catch (error) {
    // TODO: Add Better Error Logging
    // console.log("getComponentNameFromFiber error", error);
    // console.log("getComponentNameFromFiber working fiber", fiber.tag);
  }
  return null;
}
