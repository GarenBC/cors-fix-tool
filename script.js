function applyCorsFix(yamlString) {
  let patched = yamlString;
  let changes = [];

  const corsMethodResponses = `MethodResponses:
  - StatusCode: 200
    ResponseParameters:
      method.response.header.Access-Control-Allow-Origin: true
      method.response.header.Access-Control-Allow-Headers: true
      method.response.header.Access-Control-Allow-Methods: true`;

  const corsIntegrationResponses = `IntegrationResponses:
  - StatusCode: 200
    ResponseParameters:
      method.response.header.Access-Control-Allow-Origin: "'*'"
      method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      method.response.header.Access-Control-Allow-Methods: "'GET'"
    ResponseTemplates:
      application/json: ""`;

  // Match all AWS::ApiGateway::Method blocks
  const methodRegex = /^(\s*)(\w+):\s*\n(?:\1  .*\n)*\1  Type: AWS::ApiGateway::Method/gm;
  const methodMatches = [...yamlString.matchAll(methodRegex)];

  methodMatches.forEach((match) => {
    const indent = match[1];
    const methodName = match[2];

    const blockRegex = new RegExp(`(${indent}${methodName}:\\s*\\n(?:${indent}  .*\\n)*)`, 'gm');
    patched = patched.replace(blockRegex, (blockMatch) => {
      let modifiedBlock = blockMatch;
      let didPatch = false;

      if (!blockMatch.includes('IntegrationResponses')) {
        modifiedBlock += `\n${indent}  ${corsIntegrationResponses.replace(/\n/g, `\n${indent}  `)}`;
        didPatch = true;
      }

      if (!blockMatch.includes('MethodResponses')) {
        modifiedBlock += `\n${indent}  ${corsMethodResponses.replace(/\n/g, `\n${indent}  `)}`;
        didPatch = true;
      }

      if (didPatch) {
        changes.push(methodName);
        return `<span class="highlight-added">\n${modifiedBlock.trim()}\n</span>\n`;
      }

      return blockMatch;
    });
  });

  return patched;
}