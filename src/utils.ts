export function getComponentNameFromFiber(
  fiber: any,
  getComponentNameFromType: any,
  REACT_STRICT_MODE_TYPE: any
) {
  var type = fiber.type;
  switch (fiber.tag) {
    case 24:
      return 'Cache';
    case 9:
      return (type._context.displayName || 'Context') + '.Consumer';
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
        return getComponentNameFromFiber(
          fiber.return,
          getComponentNameFromType,
          REACT_STRICT_MODE_TYPE
        );
  }
  return null;
}
