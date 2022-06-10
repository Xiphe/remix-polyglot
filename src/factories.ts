import ts, { factory as f } from 'typescript';

export function createImports() {
  return [
    f.createImportDeclaration(
      undefined,
      undefined,
      f.createImportClause(
        true,
        undefined,
        f.createNamedImports([
          f.createImportSpecifier(
            false,
            undefined,
            f.createIdentifier('Dispatch'),
          ),
          f.createImportSpecifier(
            false,
            undefined,
            f.createIdentifier('SetStateAction'),
          ),
        ]),
      ),
      f.createStringLiteral('react'),
      undefined,
    ),
    f.createImportDeclaration(
      undefined,
      undefined,
      f.createImportClause(true, f.createIdentifier('RP'), undefined),
      f.createStringLiteral('remix-polyglot/server', true),
    ),
  ];
}

export function additionalPolyglotMembers() {
  return [
    f.createMethodSignature(
      undefined,
      f.createIdentifier('clear'),
      undefined,
      undefined,
      [],
      f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
    ),
    f.createMethodSignature(
      undefined,
      f.createIdentifier('has'),
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          f.createIdentifier('phrase'),
          undefined,
          f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          undefined,
        ),
      ],
      f.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
    ),
    f.createPropertySignature(
      undefined,
      f.createIdentifier('locale'),
      undefined,
      f.createTypeReferenceNode(f.createIdentifier('Locale'), undefined),
    ),
  ];
}

export function createBetterRemixPolyglotTypes(
  supportedLocales: string[],
  allNamespaces: string[],
  mainNamespaces: string[],
  polyglotDeclarations: ts.Statement[],
) {
  return f.createModuleDeclaration(
    undefined,
    [f.createModifier(ts.SyntaxKind.DeclareKeyword)],
    f.createStringLiteral('remix-polyglot'),
    f.createModuleBlock([
      f.createTypeAliasDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        f.createIdentifier('Locale'),
        undefined,
        f.createUnionTypeNode(
          supportedLocales.map((locale) =>
            f.createLiteralTypeNode(f.createStringLiteral(locale)),
          ),
        ),
      ),
      f.createTypeAliasDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        f.createIdentifier('Namespace'),
        undefined,
        f.createUnionTypeNode(
          allNamespaces.map((namespace) =>
            f.createLiteralTypeNode(f.createStringLiteral(namespace)),
          ),
        ),
      ),
      f.createInterfaceDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        f.createIdentifier('I18nHandle'),
        undefined,
        undefined,
        [
          f.createPropertySignature(
            undefined,
            f.createIdentifier('i18n'),
            undefined,
            f.createUnionTypeNode([
              f.createTypeReferenceNode(
                f.createIdentifier('Namespace'),
                undefined,
              ),
              f.createArrayTypeNode(
                f.createTypeReferenceNode(
                  f.createIdentifier('Namespace'),
                  undefined,
                ),
              ),
            ]),
          ),
          f.createIndexSignature(
            undefined,
            undefined,
            [
              f.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                f.createIdentifier('k'),
                undefined,
                f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                undefined,
              ),
            ],
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
      ),
      f.createTypeAliasDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        f.createIdentifier('Handoff'),
        undefined,
        f.createTypeQueryNode(
          f.createQualifiedName(
            f.createIdentifier('RP'),
            f.createIdentifier('Handoff'),
          ),
          undefined,
        ),
      ),
      f.createTypeAliasDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        f.createIdentifier('setup'),
        undefined,
        f.createTypeQueryNode(
          f.createQualifiedName(
            f.createIdentifier('RP'),
            f.createIdentifier('setup'),
          ),
          undefined,
        ),
      ),
      ...polyglotDeclarations,
      f.createFunctionDeclaration(
        undefined,
        [f.createModifier(ts.SyntaxKind.ExportKeyword)],
        undefined,
        f.createIdentifier('useLocale'),
        undefined,
        [],
        f.createTupleTypeNode([
          f.createTypeReferenceNode(f.createIdentifier('Locale'), undefined),
          f.createTypeReferenceNode(f.createIdentifier('Dispatch'), [
            f.createTypeReferenceNode(f.createIdentifier('SetStateAction'), [
              f.createTypeReferenceNode(
                f.createIdentifier('Locale'),
                undefined,
              ),
            ]),
          ]),
        ]),
        undefined,
      ),
      ...(mainNamespaces.includes('common')
        ? [
            f.createFunctionDeclaration(
              undefined,
              [f.createModifier(ts.SyntaxKind.ExportKeyword)],
              undefined,
              f.createIdentifier('usePolyglot'),
              undefined,
              [],
              f.createTypeReferenceNode(
                f.createIdentifier('CommonPolyglot'),
                undefined,
              ),
              undefined,
            ),
          ]
        : []),
      ...mainNamespaces.map((namespace) =>
        f.createFunctionDeclaration(
          undefined,
          [f.createModifier(ts.SyntaxKind.ExportKeyword)],
          undefined,
          f.createIdentifier('usePolyglot'),
          undefined,
          [
            f.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              f.createIdentifier('namespace'),
              undefined,
              f.createLiteralTypeNode(f.createStringLiteral(namespace)),
              undefined,
            ),
          ],
          f.createTypeReferenceNode(
            f.createIdentifier(`${ucFirst(namespace)}Polyglot`),
            undefined,
          ),
          undefined,
        ),
      ),
    ]),
  );
}

export function ucFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
