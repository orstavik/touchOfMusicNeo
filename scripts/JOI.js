/**
 **************** TOKENIZER *****************
 */

/**
 * Created by orstavik on 24.11.16.
 */
class JOITokenizer {

  constructor(txt) {
    this.txt = txt.trim();
    this.t1 = this.makeToken(); //setup t1
    this.t2 = this.makeToken(); //setup t2
  }

  nextToken() {
    let res = this.t1;
    this.t1 = this.t2;
    this.t2 = this.makeToken();
    return res;
  }

  nextTokenIs(type) {
    return this.t1 ? this.t1.type == type : false;
  }

  nextNextTokenIs(type) {
    return this.t2 ? this.t2.type == type : false;
  }

  isEmpty() {
    return !this.t1;
  }

  makeToken() {
    if (!this.txt) //empty or null
      return null;
    let res;
    //tokens that can eat whitespace
    if (res = this.pipe())
      return this.setup("|", res);
    if (res = this.mapStop())
      return this.setup("]", res);
    //tokens that cannot have whitespace infront without it meaning a new column in a map
    if (res = this.space())
      return this.setup("space", res);
    if (res = this.mapStart())
      return this.setup("[", res);
    if (res = this.name())
      return this.setup("name", res);
    if (res = this.number())
      return this.setup("number", res);
    if (res = this.operator())
      return this.setup("operator", res);
    if (res = this.declarator())
      return this.setup("@", res);
    if (res = this.reference())
      return this.setup("!", res);
    if (res = this.comma())
      return this.setup(",", res);
    if (res = this.colon())
      return this.setup(":", res);
    if (res = this.singleQuote())
      return this.setupQuote("'", res);
    if (res = this.doubleQuote())
      return this.setupQuote('"', res);
    if (res = this.backQuote())
      return this.setupQuote("`", res);
    throw new SyntaxError("Unknown JOI character: " + this.txt[0]);
  }

  setupQuote(name, res) {
    let t = this.setup(name, res);
    let nextQ = this.txt.indexOf(name);
    if (nextQ == -1)
      throw new SyntaxError("Missing quote end: " + name + this.txt);
    t.value = this.txt.substr(0, nextQ);
    this.txt = this.txt.substr(t.value.length +1);
    return t;
  }

  setup(name, res) {
    this.txt = this.txt.substr(res[0].length);
    if (name == "number")
      return {type: name, value: Number(res[0])};
    return {type: name, value: res[0]};
  }

  nextCanBeAValue() {
    return this.t1 && (this.t1.type == "'" || this.t1.type == '"' || this.t1.type == "`" ||
      this.t1.type == "string" || this.t1.type == "number" || this.t1.type == "operator" || this.t1.type == "name");
  }

  nextTokenIsValidReferenceName() {
    return this.nextTokenIs("string") || this.nextTokenIs("@") || this.nextTokenIs("number") || this.nextTokenIs("name");
  }

  /**
   * Pipe '|' can have whitespace infront without it meaning a new column
   */
  pipe() {
    return this.txt.match(/^[\s]*\|/i);
  }


  /**
   * MapStop ']' can have whitespace infront without it meaning a new column
   */
  mapStop() {
    return this.txt.match(/^[\s]*]/i);
  }

  space() {
    return this.txt.match(/^[\s]+/i);
  }

  /**
   * MapStart '[' can have whitespace after it without the space meaning a new column
   */
  mapStart() {
    return this.txt.match(/^\[\s*/i);
  }

  name() {
    return this.txt.match(/^[^\s|[\];:,@!*+/0-9.'"`-]{1}[^\s|[\];:,@!'"`]*/i);
  }

  operator() {
    return this.txt.match(/^[+/]|^[*]{1,2}/i);
  }

  number() {
    return this.txt.match(/^[\d.-]+/i);
  }

  declarator() {
    return this.txt.match(/^@/i);
  }

  reference() {
    return this.txt.match(/^!/i);
  }

  comma() {
    return this.txt.match(/^,/i);
  }

  colon() {
    return this.txt.match(/^:/i);
  }

  singleQuote() {
    return this.txt.match(/^'/i);
  }

  doubleQuote() {
    return this.txt.match(/^"/i);
  }

  backQuote() {
    return this.txt.match(/^`/i);
  }
}


/**
 **************** PARSER *****************
 */
class JOIParser {

  static parse(txt) {
    //todo there is a bug if there is trailing whitespace. Its fixed with .trim() in the tokenizer, but i'm not sure its the best fix.
    let tokens = new JOITokenizer(txt);
    return JOIParser.parseMap(tokens);
  }

  static parseMap(text) {
    let res = [];
    let mapStart = null;
    if (text.nextTokenIs("["))
      mapStart = text.nextToken();
    for (let i = 0; true; i++) {
      res[i] = JOIParser.parseRow(text);
      if (text.nextTokenIs("space")) {
        text.nextToken();
        continue;
      }
      if (text.nextTokenIs("]")) {    //mapstop
        if (!mapStart)
          throw new SyntaxError("Map stop ']' without corresponding map start '['. " + text);
        text.nextToken();
        return res;
      }
      if (text.isEmpty()) {
        if (mapStart)
          throw new SyntaxError("Map start '[' without corresponding map end ']'. " + text);
        return res;
      }
      throw new SyntaxError("A bug in JOIParser.parseMap(): " + text);
    }
  }

  static parseRow(text) {
    let res = [];
    for (let i = 0; true; i++) {
      res[i] = JOIParser.parseObjectDeclarationMap(text);
      if (!text.nextTokenIs("|"))
        return res;
      text.nextToken(); //pop the pipe
    }
  }

  static parseObjectDeclarationMap(text) {
    if (text.nextTokenIs("["))
      return JOIParser.parseMap(text);
    if (text.nextNextTokenIs("@"))
      return JOIParser.parseNamedDeclaration(text);
    return JOIParser.parseObject(text);
  }

  static parseNamedDeclaration(text) {
    if (!text.nextTokenIsValidReferenceName())
      throw new SyntaxError("Illegal declaration name: A declaration must be named as either a name or number or '@' (the default type).")
    let name = text.nextToken(); //name
    text.nextToken(); //pop @
    return {
      declaration: name.value,
      value: JOIParser.parseObject(text)
    };
  }

  static parseObject(text) {
    let refs = [];
    while (text.nextNextTokenIs("!")) {
      if (!text.nextTokenIsValidReferenceName())
        throw new SyntaxError("Illegal reference name: A reference must be named as either a name or number or '@' (the default type).");
      let name = text.nextToken(); //name
      refs.push(name.value);
      text.nextToken(); //pop !
    }
    return {
      reference: refs,
      value: JOIParser.parseArguments(text)
    };
  }

  static parseArguments(text) {
    let args = {};
    let argsWithoutPropIsOk = true;
    let i = 0;
    argsWithoutPropIsOk = JOIParser.parseArgument(args, i++, text, argsWithoutPropIsOk);
    while (text.nextTokenIs(",")) {
      text.nextToken();
      argsWithoutPropIsOk = JOIParser.parseArgument(args, i++, text, argsWithoutPropIsOk);
    }
    return args;
  }

  static parseArgument(args, i, text, argsWithoutPropIsOk) {
    if (text.nextTokenIs(","))    //empty argument
      return argsWithoutPropIsOk;
    args[i] = JOIParser.parseProperty(text);
    args[i].propertyNumber = i;       //todo add number to properties
    if (!args[i].propertyName) {
      if (!argsWithoutPropIsOk)
        throw new SyntaxError("Cannot have a named unnamed property before an unnamed property");
      return true;
    }
    args[args[i].propertyName] = args[i];
    delete args[i];
    return false;
  }

  static parseProperty(text) {
    let argument = {};
    if (text.nextNextTokenIs(":")) {
      if (!text.nextTokenIsValidReferenceName())
        throw new SyntaxError("Illegal property name: A property must be named as either a name or number or '@' (the default type).");
      let prop = text.nextToken();
      argument.propertyName = prop.value;
      text.nextToken(); //pop ':'
    }
    argument.value = JOIParser.parseValue(text);
    return argument;
  }

  static parseValue(text) {
    let value = {};
    if (!text.nextCanBeAValue())
      return null;
    if (text.nextTokenIs("operator"))
      value.operator = text.nextToken().value;
    value.primitive = text.nextToken().value;
    return value;
  }
}



/**
 * O JOI!
 */
class JOI {

  //todo simplify maps if requested
  //if there is only one entry in a map, then unwrap it.
  //if there is only one entry for all subMaps, then unwrap all subMaps
  // JOI.simplifyMaps(AST);
  // simplify(obj){
  //   return simplify obj;
  // }

  constructor(txt) {
    this.AST = JOIParser.parse(txt);

    this.declarations = [];
    this.flattenedDeclarations = [];

    //get declarations@ and references!. returns maps with string name => object.
    this.getAllDeclarations(this.AST);
    this.resolveDeclarations();

    // var clonedAST = JSON.parse(JSON.stringify(this.AST));
    this.result = this.resolveAST(this.AST);
  }

  static parse(txt) {
    let joi = new JOI(txt);
    return joi.result;
  }


  resolveAST(ASTnode) {
    if (Array.isArray(ASTnode)) {
      let res = [];
      for (let i = 0; i < ASTnode.length; i++){
        let node = this.resolveAST(ASTnode[i]);
        if (node != null)
          res.push(node);
      }
      if (res.length == 0)
        return null;
      return res;
    } else if (ASTnode.declaration) {
      return null;
    } else {
      ASTnode = JSON.parse(JSON.stringify(ASTnode)); //cloning the object to keep the original intact, unnecessary
      let resolvedObj = this.resolveRefsInObject(ASTnode);
      for (let pName in resolvedObj) {
        let prop = resolvedObj[pName];
        resolvedObj[pName] = prop.value.primitive;
      }
      return resolvedObj;
    }
  }

  getAllDeclarations(ASTnode) {
    if (Array.isArray(ASTnode)) {
      for (let i = 0; i < ASTnode.length; i++)
        this.getAllDeclarations(ASTnode[i]);
    } else if (ASTnode.declaration) {
      this.declarations[ASTnode.declaration] = ASTnode.value;
    }
  }

  resolveDeclarations() {
    for (let decName in this.declarations)
      this.flattenedDeclarations[decName] = this.resolveReference(decName);
  }

  //you get an error when you ask for a reference that does not exist?
  resolveReference(refName) {
    if (this.flattenedDeclarations[refName])
      return this.flattenedDeclarations[refName];

    if (!this.declarations[refName])
      throw new SyntaxError("Undeclared reference: " + refName);

    let body = this.declarations[refName];

    if (body.reference.length == 0) {
      delete this.declarations[refName];
      return this.flattenedDeclarations[refName] = body.value;
    }

    //now we have an object, it has not been resolved yet, we
    return this.resolveRefsInObject(body);
  }

  resolveRefsInObject(body) {
    body.flatReferences = [];
    for (var i = 0; i < body.reference.length; i++)
      body.flatReferences[i] = this.resolveReference(body.reference[i]);

    let parent = body.flatReferences.shift(); //check if its the first
    while (body.flatReferences.length > 0) {
      let child = body.flatReferences.shift();
      parent = JOI.resolveObject(parent, child);
    }
    return parent;
  }

  static resolveObject(parent, child) {
    var clone = JSON.parse(JSON.stringify(parent));
    for (let prop in child)
      JOI.resolveProperty(clone, child[prop]);
    return clone;
  }

  static  resolveProperty(host, childsProperty) {
    //use propName first if you can.
    if (childsProperty.propertyName)
      return host[propName].value.primitive = JOI.mergeProps(host[propName], childsProperty);
    if (host[childsProperty.propertyNumber])
      return host[childsProperty.propertyNumber].value.primitive = JOI.mergeProps(host[childsProperty.propertyNumber], childsProperty);

    for (let prop in host) {
      if (host[prop].propertyNumber == childsProperty.propertyNumber) {
        let propName = host[prop].propertyName;
        return host[propName].value.primitive = JOI.mergeProps(host[propName], childsProperty);
      }
    }
    return host[propName].value.primitive = JOI.mergeProps(null, childsProperty);
  }

  static  mergeProps(hostProp, childProp) {
    if (!hostProp)
      return childProp;
    delete hostProp.operator;
    return JOI.resolveOperator(childProp.value.operator, hostProp.value.primitive, childProp.value.primitive);
  }

  static  resolveOperator(op, parent, child) {
    if (!op)
      return child;
    if (op == "+")
      return parent + child;

    if (typeof child == "String" || typeof parent == "String")
      throw new SyntaxError("Only '+' operator is allowed for strings");

    if (op == "/")
      return parent / child;
    if (op == "*")
      return parent * child;
    if (op == "**")
      return parent ** child;
  }
}