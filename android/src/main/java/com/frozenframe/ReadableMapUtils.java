package com.frozenframe;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import org.json.JSONException;
import org.json.JSONObject;

public class ReadableMapUtils {

    public static String readableMapToJSONString(ReadableMap readableMap) {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("{\n");
        String indent = "  ";
        String currentIndent = "";
        addMapToStringBuilder(readableMap, stringBuilder, indent, currentIndent);
        stringBuilder.append("}\n");
        return stringBuilder.toString();
    }

    private static void addMapToStringBuilder(ReadableMap readableMap, StringBuilder stringBuilder, String indent, String currentIndent) {
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while (iterator.hasNextKey()) {
            boolean useValueString = true;
            String key = iterator.nextKey();
            String valueString;
            switch (readableMap.getType(key)) {
                case Null:
                    valueString = "null";
                    break;
                case Boolean:
                    valueString = String.valueOf(readableMap.getBoolean(key));
                    break;
                case Number:
                    valueString = String.valueOf(readableMap.getDouble(key));
                    break;
                case String:
                    String stringValue = readableMap.getString(key);
                    if (isValidJSON(stringValue)) {
                        valueString = stringValue;
                    } else {
                        valueString = "\"" + stringValue + "\"";
                    }
                    break;
                case Map:
                    stringBuilder.append(currentIndent).append(indent).append("\"").append(key).append("\": {\n");
                    addMapToStringBuilder(readableMap.getMap(key), stringBuilder, indent, currentIndent + indent);
                    valueString = "";
                    useValueString = false;
                    stringBuilder.append(currentIndent).append(indent).append("}");
                    break;
                case Array:
                    stringBuilder.append(currentIndent).append(indent).append("\"").append(key).append("\": [\n");
                    for (int i = 0; i < readableMap.getArray(key).size(); i++) {
                        stringBuilder.append(currentIndent).append(indent).append(" {\n");
                        addMapToStringBuilder(readableMap.getArray(key).getMap(i), stringBuilder, indent, currentIndent + indent);
                        if (i == readableMap.getArray(key).size() - 1) {
                            stringBuilder.append(currentIndent).append(indent).append(" }\n");
                        } else {
                            stringBuilder.append(currentIndent).append(indent).append(" },\n");
                        }
                    }
                    useValueString = false;
                    stringBuilder.append(currentIndent).append(indent).append("]");
                    valueString = "";
                    break;
                default:
                    valueString = ""; 
            }
            if (useValueString) {
                stringBuilder.append(currentIndent).append(indent).append("\"").append(key).append("\": ").append(valueString);
            }
            if (iterator.hasNextKey()) {
                stringBuilder.append(",");
            }
            stringBuilder.append("\n");
        }
    }

    private static boolean isValidJSON(String value) {
        if (value == null) {
            return false;
        }
        try {
            new JSONObject(value);
            return true;
        } catch (JSONException ex) {
            try {
                new org.json.JSONArray(value);
                return true;
            } catch (JSONException ex2) {
                return false;
            }
        }
    }
}
