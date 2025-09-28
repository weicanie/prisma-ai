
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model user
 * 
 */
export type user = $Result.DefaultSelection<Prisma.$userPayload>
/**
 * Model user_article
 * 
 */
export type user_article = $Result.DefaultSelection<Prisma.$user_articlePayload>
/**
 * Model article
 * 
 */
export type article = $Result.DefaultSelection<Prisma.$articlePayload>
/**
 * Model user_project
 * 
 */
export type user_project = $Result.DefaultSelection<Prisma.$user_projectPayload>
/**
 * Model project_file
 * 
 */
export type project_file = $Result.DefaultSelection<Prisma.$project_filePayload>
/**
 * Model project_file_chunk
 * 
 */
export type project_file_chunk = $Result.DefaultSelection<Prisma.$project_file_chunkPayload>
/**
 * Model ai_conversation
 * 
 */
export type ai_conversation = $Result.DefaultSelection<Prisma.$ai_conversationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **user** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.userDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user_article`: Exposes CRUD operations for the **user_article** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more User_articles
    * const user_articles = await prisma.user_article.findMany()
    * ```
    */
  get user_article(): Prisma.user_articleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.article`: Exposes CRUD operations for the **article** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Articles
    * const articles = await prisma.article.findMany()
    * ```
    */
  get article(): Prisma.articleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user_project`: Exposes CRUD operations for the **user_project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more User_projects
    * const user_projects = await prisma.user_project.findMany()
    * ```
    */
  get user_project(): Prisma.user_projectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project_file`: Exposes CRUD operations for the **project_file** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Project_files
    * const project_files = await prisma.project_file.findMany()
    * ```
    */
  get project_file(): Prisma.project_fileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project_file_chunk`: Exposes CRUD operations for the **project_file_chunk** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Project_file_chunks
    * const project_file_chunks = await prisma.project_file_chunk.findMany()
    * ```
    */
  get project_file_chunk(): Prisma.project_file_chunkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ai_conversation`: Exposes CRUD operations for the **ai_conversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ai_conversations
    * const ai_conversations = await prisma.ai_conversation.findMany()
    * ```
    */
  get ai_conversation(): Prisma.ai_conversationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    user: 'user',
    user_article: 'user_article',
    article: 'article',
    user_project: 'user_project',
    project_file: 'project_file',
    project_file_chunk: 'project_file_chunk',
    ai_conversation: 'ai_conversation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "user_article" | "article" | "user_project" | "project_file" | "project_file_chunk" | "ai_conversation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      user: {
        payload: Prisma.$userPayload<ExtArgs>
        fields: Prisma.userFieldRefs
        operations: {
          findUnique: {
            args: Prisma.userFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.userFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findFirst: {
            args: Prisma.userFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.userFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findMany: {
            args: Prisma.userFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          create: {
            args: Prisma.userCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          createMany: {
            args: Prisma.userCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.userDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          update: {
            args: Prisma.userUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          deleteMany: {
            args: Prisma.userDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.userUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.userUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.userGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.userCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      user_article: {
        payload: Prisma.$user_articlePayload<ExtArgs>
        fields: Prisma.user_articleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.user_articleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.user_articleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          findFirst: {
            args: Prisma.user_articleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.user_articleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          findMany: {
            args: Prisma.user_articleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>[]
          }
          create: {
            args: Prisma.user_articleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          createMany: {
            args: Prisma.user_articleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.user_articleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          update: {
            args: Prisma.user_articleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          deleteMany: {
            args: Prisma.user_articleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.user_articleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.user_articleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_articlePayload>
          }
          aggregate: {
            args: Prisma.User_articleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser_article>
          }
          groupBy: {
            args: Prisma.user_articleGroupByArgs<ExtArgs>
            result: $Utils.Optional<User_articleGroupByOutputType>[]
          }
          count: {
            args: Prisma.user_articleCountArgs<ExtArgs>
            result: $Utils.Optional<User_articleCountAggregateOutputType> | number
          }
        }
      }
      article: {
        payload: Prisma.$articlePayload<ExtArgs>
        fields: Prisma.articleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.articleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.articleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          findFirst: {
            args: Prisma.articleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.articleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          findMany: {
            args: Prisma.articleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>[]
          }
          create: {
            args: Prisma.articleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          createMany: {
            args: Prisma.articleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.articleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          update: {
            args: Prisma.articleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          deleteMany: {
            args: Prisma.articleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.articleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.articleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$articlePayload>
          }
          aggregate: {
            args: Prisma.ArticleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateArticle>
          }
          groupBy: {
            args: Prisma.articleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ArticleGroupByOutputType>[]
          }
          count: {
            args: Prisma.articleCountArgs<ExtArgs>
            result: $Utils.Optional<ArticleCountAggregateOutputType> | number
          }
        }
      }
      user_project: {
        payload: Prisma.$user_projectPayload<ExtArgs>
        fields: Prisma.user_projectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.user_projectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.user_projectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          findFirst: {
            args: Prisma.user_projectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.user_projectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          findMany: {
            args: Prisma.user_projectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>[]
          }
          create: {
            args: Prisma.user_projectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          createMany: {
            args: Prisma.user_projectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.user_projectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          update: {
            args: Prisma.user_projectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          deleteMany: {
            args: Prisma.user_projectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.user_projectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.user_projectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_projectPayload>
          }
          aggregate: {
            args: Prisma.User_projectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser_project>
          }
          groupBy: {
            args: Prisma.user_projectGroupByArgs<ExtArgs>
            result: $Utils.Optional<User_projectGroupByOutputType>[]
          }
          count: {
            args: Prisma.user_projectCountArgs<ExtArgs>
            result: $Utils.Optional<User_projectCountAggregateOutputType> | number
          }
        }
      }
      project_file: {
        payload: Prisma.$project_filePayload<ExtArgs>
        fields: Prisma.project_fileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.project_fileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.project_fileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          findFirst: {
            args: Prisma.project_fileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.project_fileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          findMany: {
            args: Prisma.project_fileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>[]
          }
          create: {
            args: Prisma.project_fileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          createMany: {
            args: Prisma.project_fileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.project_fileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          update: {
            args: Prisma.project_fileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          deleteMany: {
            args: Prisma.project_fileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.project_fileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.project_fileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_filePayload>
          }
          aggregate: {
            args: Prisma.Project_fileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject_file>
          }
          groupBy: {
            args: Prisma.project_fileGroupByArgs<ExtArgs>
            result: $Utils.Optional<Project_fileGroupByOutputType>[]
          }
          count: {
            args: Prisma.project_fileCountArgs<ExtArgs>
            result: $Utils.Optional<Project_fileCountAggregateOutputType> | number
          }
        }
      }
      project_file_chunk: {
        payload: Prisma.$project_file_chunkPayload<ExtArgs>
        fields: Prisma.project_file_chunkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.project_file_chunkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.project_file_chunkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          findFirst: {
            args: Prisma.project_file_chunkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.project_file_chunkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          findMany: {
            args: Prisma.project_file_chunkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>[]
          }
          create: {
            args: Prisma.project_file_chunkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          createMany: {
            args: Prisma.project_file_chunkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.project_file_chunkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          update: {
            args: Prisma.project_file_chunkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          deleteMany: {
            args: Prisma.project_file_chunkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.project_file_chunkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.project_file_chunkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$project_file_chunkPayload>
          }
          aggregate: {
            args: Prisma.Project_file_chunkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject_file_chunk>
          }
          groupBy: {
            args: Prisma.project_file_chunkGroupByArgs<ExtArgs>
            result: $Utils.Optional<Project_file_chunkGroupByOutputType>[]
          }
          count: {
            args: Prisma.project_file_chunkCountArgs<ExtArgs>
            result: $Utils.Optional<Project_file_chunkCountAggregateOutputType> | number
          }
        }
      }
      ai_conversation: {
        payload: Prisma.$ai_conversationPayload<ExtArgs>
        fields: Prisma.ai_conversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ai_conversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ai_conversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          findFirst: {
            args: Prisma.ai_conversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ai_conversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          findMany: {
            args: Prisma.ai_conversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>[]
          }
          create: {
            args: Prisma.ai_conversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          createMany: {
            args: Prisma.ai_conversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ai_conversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          update: {
            args: Prisma.ai_conversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          deleteMany: {
            args: Prisma.ai_conversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ai_conversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ai_conversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ai_conversationPayload>
          }
          aggregate: {
            args: Prisma.Ai_conversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAi_conversation>
          }
          groupBy: {
            args: Prisma.ai_conversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ai_conversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ai_conversationCountArgs<ExtArgs>
            result: $Utils.Optional<Ai_conversationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: userOmit
    user_article?: user_articleOmit
    article?: articleOmit
    user_project?: user_projectOmit
    project_file?: project_fileOmit
    project_file_chunk?: project_file_chunkOmit
    ai_conversation?: ai_conversationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    user_articles: number
    ai_conversation: number
    user_project: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_articles?: boolean | UserCountOutputTypeCountUser_articlesArgs
    ai_conversation?: boolean | UserCountOutputTypeCountAi_conversationArgs
    user_project?: boolean | UserCountOutputTypeCountUser_projectArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUser_articlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_articleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAi_conversationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ai_conversationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUser_projectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_projectWhereInput
  }


  /**
   * Count Type ArticleCountOutputType
   */

  export type ArticleCountOutputType = {
    user_articles: number
  }

  export type ArticleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_articles?: boolean | ArticleCountOutputTypeCountUser_articlesArgs
  }

  // Custom InputTypes
  /**
   * ArticleCountOutputType without action
   */
  export type ArticleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ArticleCountOutputType
     */
    select?: ArticleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ArticleCountOutputType without action
   */
  export type ArticleCountOutputTypeCountUser_articlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_articleWhereInput
  }


  /**
   * Count Type User_projectCountOutputType
   */

  export type User_projectCountOutputType = {
    project_file: number
  }

  export type User_projectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project_file?: boolean | User_projectCountOutputTypeCountProject_fileArgs
  }

  // Custom InputTypes
  /**
   * User_projectCountOutputType without action
   */
  export type User_projectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User_projectCountOutputType
     */
    select?: User_projectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * User_projectCountOutputType without action
   */
  export type User_projectCountOutputTypeCountProject_fileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: project_fileWhereInput
  }


  /**
   * Count Type Project_fileCountOutputType
   */

  export type Project_fileCountOutputType = {
    chunks: number
  }

  export type Project_fileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chunks?: boolean | Project_fileCountOutputTypeCountChunksArgs
  }

  // Custom InputTypes
  /**
   * Project_fileCountOutputType without action
   */
  export type Project_fileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project_fileCountOutputType
     */
    select?: Project_fileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Project_fileCountOutputType without action
   */
  export type Project_fileCountOutputTypeCountChunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: project_file_chunkWhereInput
  }


  /**
   * Models
   */

  /**
   * Model user
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    create_at: Date | null
    update_at: Date | null
    email: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    create_at: Date | null
    update_at: Date | null
    email: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    password: number
    create_at: number
    update_at: number
    email: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    password?: true
    create_at?: true
    update_at?: true
    email?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    password?: true
    create_at?: true
    update_at?: true
    email?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    password?: true
    create_at?: true
    update_at?: true
    email?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user to aggregate.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type userGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userWhereInput
    orderBy?: userOrderByWithAggregationInput | userOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: userScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    username: string
    password: string
    create_at: Date | null
    update_at: Date | null
    email: string
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends userGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type userSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    create_at?: boolean
    update_at?: boolean
    email?: boolean
    user_articles?: boolean | user$user_articlesArgs<ExtArgs>
    ai_conversation?: boolean | user$ai_conversationArgs<ExtArgs>
    user_project?: boolean | user$user_projectArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>



  export type userSelectScalar = {
    id?: boolean
    username?: boolean
    password?: boolean
    create_at?: boolean
    update_at?: boolean
    email?: boolean
  }

  export type userOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "password" | "create_at" | "update_at" | "email", ExtArgs["result"]["user"]>
  export type userInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_articles?: boolean | user$user_articlesArgs<ExtArgs>
    ai_conversation?: boolean | user$ai_conversationArgs<ExtArgs>
    user_project?: boolean | user$user_projectArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $userPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user"
    objects: {
      user_articles: Prisma.$user_articlePayload<ExtArgs>[]
      ai_conversation: Prisma.$ai_conversationPayload<ExtArgs>[]
      user_project: Prisma.$user_projectPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      password: string
      create_at: Date | null
      update_at: Date | null
      email: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type userGetPayload<S extends boolean | null | undefined | userDefaultArgs> = $Result.GetResult<Prisma.$userPayload, S>

  type userCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<userFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface userDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user'], meta: { name: 'user' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {userFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends userFindUniqueArgs>(args: SelectSubset<T, userFindUniqueArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {userFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends userFindUniqueOrThrowArgs>(args: SelectSubset<T, userFindUniqueOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends userFindFirstArgs>(args?: SelectSubset<T, userFindFirstArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends userFindFirstOrThrowArgs>(args?: SelectSubset<T, userFindFirstOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends userFindManyArgs>(args?: SelectSubset<T, userFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {userCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends userCreateArgs>(args: SelectSubset<T, userCreateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {userCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends userCreateManyArgs>(args?: SelectSubset<T, userCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {userDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends userDeleteArgs>(args: SelectSubset<T, userDeleteArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {userUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends userUpdateArgs>(args: SelectSubset<T, userUpdateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {userDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends userDeleteManyArgs>(args?: SelectSubset<T, userDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends userUpdateManyArgs>(args: SelectSubset<T, userUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {userUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends userUpsertArgs>(args: SelectSubset<T, userUpsertArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends userCountArgs>(
      args?: Subset<T, userCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends userGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: userGroupByArgs['orderBy'] }
        : { orderBy?: userGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, userGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user model
   */
  readonly fields: userFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__userClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user_articles<T extends user$user_articlesArgs<ExtArgs> = {}>(args?: Subset<T, user$user_articlesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ai_conversation<T extends user$ai_conversationArgs<ExtArgs> = {}>(args?: Subset<T, user$ai_conversationArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user_project<T extends user$user_projectArgs<ExtArgs> = {}>(args?: Subset<T, user$user_projectArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user model
   */
  interface userFieldRefs {
    readonly id: FieldRef<"user", 'Int'>
    readonly username: FieldRef<"user", 'String'>
    readonly password: FieldRef<"user", 'String'>
    readonly create_at: FieldRef<"user", 'DateTime'>
    readonly update_at: FieldRef<"user", 'DateTime'>
    readonly email: FieldRef<"user", 'String'>
  }
    

  // Custom InputTypes
  /**
   * user findUnique
   */
  export type userFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findUniqueOrThrow
   */
  export type userFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findFirst
   */
  export type userFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findFirstOrThrow
   */
  export type userFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findMany
   */
  export type userFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user create
   */
  export type userCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to create a user.
     */
    data: XOR<userCreateInput, userUncheckedCreateInput>
  }

  /**
   * user createMany
   */
  export type userCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: userCreateManyInput | userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user update
   */
  export type userUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to update a user.
     */
    data: XOR<userUpdateInput, userUncheckedUpdateInput>
    /**
     * Choose, which user to update.
     */
    where: userWhereUniqueInput
  }

  /**
   * user updateMany
   */
  export type userUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: userWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * user upsert
   */
  export type userUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The filter to search for the user to update in case it exists.
     */
    where: userWhereUniqueInput
    /**
     * In case the user found by the `where` argument doesn't exist, create a new user with this data.
     */
    create: XOR<userCreateInput, userUncheckedCreateInput>
    /**
     * In case the user was found with the provided `where` argument, update it with this data.
     */
    update: XOR<userUpdateInput, userUncheckedUpdateInput>
  }

  /**
   * user delete
   */
  export type userDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter which user to delete.
     */
    where: userWhereUniqueInput
  }

  /**
   * user deleteMany
   */
  export type userDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: userWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * user.user_articles
   */
  export type user$user_articlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    where?: user_articleWhereInput
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    cursor?: user_articleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: User_articleScalarFieldEnum | User_articleScalarFieldEnum[]
  }

  /**
   * user.ai_conversation
   */
  export type user$ai_conversationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    where?: ai_conversationWhereInput
    orderBy?: ai_conversationOrderByWithRelationInput | ai_conversationOrderByWithRelationInput[]
    cursor?: ai_conversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ai_conversationScalarFieldEnum | Ai_conversationScalarFieldEnum[]
  }

  /**
   * user.user_project
   */
  export type user$user_projectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    where?: user_projectWhereInput
    orderBy?: user_projectOrderByWithRelationInput | user_projectOrderByWithRelationInput[]
    cursor?: user_projectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: User_projectScalarFieldEnum | User_projectScalarFieldEnum[]
  }

  /**
   * user without action
   */
  export type userDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
  }


  /**
   * Model user_article
   */

  export type AggregateUser_article = {
    _count: User_articleCountAggregateOutputType | null
    _avg: User_articleAvgAggregateOutputType | null
    _sum: User_articleSumAggregateOutputType | null
    _min: User_articleMinAggregateOutputType | null
    _max: User_articleMaxAggregateOutputType | null
  }

  export type User_articleAvgAggregateOutputType = {
    id: number | null
    user_id: number | null
    article_id: number | null
  }

  export type User_articleSumAggregateOutputType = {
    id: number | null
    user_id: number | null
    article_id: number | null
  }

  export type User_articleMinAggregateOutputType = {
    id: number | null
    user_id: number | null
    article_id: number | null
  }

  export type User_articleMaxAggregateOutputType = {
    id: number | null
    user_id: number | null
    article_id: number | null
  }

  export type User_articleCountAggregateOutputType = {
    id: number
    user_id: number
    article_id: number
    _all: number
  }


  export type User_articleAvgAggregateInputType = {
    id?: true
    user_id?: true
    article_id?: true
  }

  export type User_articleSumAggregateInputType = {
    id?: true
    user_id?: true
    article_id?: true
  }

  export type User_articleMinAggregateInputType = {
    id?: true
    user_id?: true
    article_id?: true
  }

  export type User_articleMaxAggregateInputType = {
    id?: true
    user_id?: true
    article_id?: true
  }

  export type User_articleCountAggregateInputType = {
    id?: true
    user_id?: true
    article_id?: true
    _all?: true
  }

  export type User_articleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_article to aggregate.
     */
    where?: user_articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_articles to fetch.
     */
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: user_articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned user_articles
    **/
    _count?: true | User_articleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: User_articleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: User_articleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: User_articleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: User_articleMaxAggregateInputType
  }

  export type GetUser_articleAggregateType<T extends User_articleAggregateArgs> = {
        [P in keyof T & keyof AggregateUser_article]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser_article[P]>
      : GetScalarType<T[P], AggregateUser_article[P]>
  }




  export type user_articleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_articleWhereInput
    orderBy?: user_articleOrderByWithAggregationInput | user_articleOrderByWithAggregationInput[]
    by: User_articleScalarFieldEnum[] | User_articleScalarFieldEnum
    having?: user_articleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: User_articleCountAggregateInputType | true
    _avg?: User_articleAvgAggregateInputType
    _sum?: User_articleSumAggregateInputType
    _min?: User_articleMinAggregateInputType
    _max?: User_articleMaxAggregateInputType
  }

  export type User_articleGroupByOutputType = {
    id: number
    user_id: number
    article_id: number
    _count: User_articleCountAggregateOutputType | null
    _avg: User_articleAvgAggregateOutputType | null
    _sum: User_articleSumAggregateOutputType | null
    _min: User_articleMinAggregateOutputType | null
    _max: User_articleMaxAggregateOutputType | null
  }

  type GetUser_articleGroupByPayload<T extends user_articleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<User_articleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof User_articleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], User_articleGroupByOutputType[P]>
            : GetScalarType<T[P], User_articleGroupByOutputType[P]>
        }
      >
    >


  export type user_articleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    article_id?: boolean
    user?: boolean | userDefaultArgs<ExtArgs>
    article?: boolean | articleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user_article"]>



  export type user_articleSelectScalar = {
    id?: boolean
    user_id?: boolean
    article_id?: boolean
  }

  export type user_articleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "article_id", ExtArgs["result"]["user_article"]>
  export type user_articleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | userDefaultArgs<ExtArgs>
    article?: boolean | articleDefaultArgs<ExtArgs>
  }

  export type $user_articlePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user_article"
    objects: {
      user: Prisma.$userPayload<ExtArgs>
      article: Prisma.$articlePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      user_id: number
      article_id: number
    }, ExtArgs["result"]["user_article"]>
    composites: {}
  }

  type user_articleGetPayload<S extends boolean | null | undefined | user_articleDefaultArgs> = $Result.GetResult<Prisma.$user_articlePayload, S>

  type user_articleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<user_articleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: User_articleCountAggregateInputType | true
    }

  export interface user_articleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user_article'], meta: { name: 'user_article' } }
    /**
     * Find zero or one User_article that matches the filter.
     * @param {user_articleFindUniqueArgs} args - Arguments to find a User_article
     * @example
     * // Get one User_article
     * const user_article = await prisma.user_article.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends user_articleFindUniqueArgs>(args: SelectSubset<T, user_articleFindUniqueArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User_article that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {user_articleFindUniqueOrThrowArgs} args - Arguments to find a User_article
     * @example
     * // Get one User_article
     * const user_article = await prisma.user_article.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends user_articleFindUniqueOrThrowArgs>(args: SelectSubset<T, user_articleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_article that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleFindFirstArgs} args - Arguments to find a User_article
     * @example
     * // Get one User_article
     * const user_article = await prisma.user_article.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends user_articleFindFirstArgs>(args?: SelectSubset<T, user_articleFindFirstArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_article that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleFindFirstOrThrowArgs} args - Arguments to find a User_article
     * @example
     * // Get one User_article
     * const user_article = await prisma.user_article.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends user_articleFindFirstOrThrowArgs>(args?: SelectSubset<T, user_articleFindFirstOrThrowArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more User_articles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all User_articles
     * const user_articles = await prisma.user_article.findMany()
     * 
     * // Get first 10 User_articles
     * const user_articles = await prisma.user_article.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const user_articleWithIdOnly = await prisma.user_article.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends user_articleFindManyArgs>(args?: SelectSubset<T, user_articleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User_article.
     * @param {user_articleCreateArgs} args - Arguments to create a User_article.
     * @example
     * // Create one User_article
     * const User_article = await prisma.user_article.create({
     *   data: {
     *     // ... data to create a User_article
     *   }
     * })
     * 
     */
    create<T extends user_articleCreateArgs>(args: SelectSubset<T, user_articleCreateArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many User_articles.
     * @param {user_articleCreateManyArgs} args - Arguments to create many User_articles.
     * @example
     * // Create many User_articles
     * const user_article = await prisma.user_article.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends user_articleCreateManyArgs>(args?: SelectSubset<T, user_articleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User_article.
     * @param {user_articleDeleteArgs} args - Arguments to delete one User_article.
     * @example
     * // Delete one User_article
     * const User_article = await prisma.user_article.delete({
     *   where: {
     *     // ... filter to delete one User_article
     *   }
     * })
     * 
     */
    delete<T extends user_articleDeleteArgs>(args: SelectSubset<T, user_articleDeleteArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User_article.
     * @param {user_articleUpdateArgs} args - Arguments to update one User_article.
     * @example
     * // Update one User_article
     * const user_article = await prisma.user_article.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends user_articleUpdateArgs>(args: SelectSubset<T, user_articleUpdateArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more User_articles.
     * @param {user_articleDeleteManyArgs} args - Arguments to filter User_articles to delete.
     * @example
     * // Delete a few User_articles
     * const { count } = await prisma.user_article.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends user_articleDeleteManyArgs>(args?: SelectSubset<T, user_articleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many User_articles
     * const user_article = await prisma.user_article.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends user_articleUpdateManyArgs>(args: SelectSubset<T, user_articleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User_article.
     * @param {user_articleUpsertArgs} args - Arguments to update or create a User_article.
     * @example
     * // Update or create a User_article
     * const user_article = await prisma.user_article.upsert({
     *   create: {
     *     // ... data to create a User_article
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User_article we want to update
     *   }
     * })
     */
    upsert<T extends user_articleUpsertArgs>(args: SelectSubset<T, user_articleUpsertArgs<ExtArgs>>): Prisma__user_articleClient<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of User_articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleCountArgs} args - Arguments to filter User_articles to count.
     * @example
     * // Count the number of User_articles
     * const count = await prisma.user_article.count({
     *   where: {
     *     // ... the filter for the User_articles we want to count
     *   }
     * })
    **/
    count<T extends user_articleCountArgs>(
      args?: Subset<T, user_articleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], User_articleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User_article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {User_articleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends User_articleAggregateArgs>(args: Subset<T, User_articleAggregateArgs>): Prisma.PrismaPromise<GetUser_articleAggregateType<T>>

    /**
     * Group by User_article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_articleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends user_articleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: user_articleGroupByArgs['orderBy'] }
        : { orderBy?: user_articleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, user_articleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUser_articleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user_article model
   */
  readonly fields: user_articleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user_article.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__user_articleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends userDefaultArgs<ExtArgs> = {}>(args?: Subset<T, userDefaultArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    article<T extends articleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, articleDefaultArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user_article model
   */
  interface user_articleFieldRefs {
    readonly id: FieldRef<"user_article", 'Int'>
    readonly user_id: FieldRef<"user_article", 'Int'>
    readonly article_id: FieldRef<"user_article", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * user_article findUnique
   */
  export type user_articleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter, which user_article to fetch.
     */
    where: user_articleWhereUniqueInput
  }

  /**
   * user_article findUniqueOrThrow
   */
  export type user_articleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter, which user_article to fetch.
     */
    where: user_articleWhereUniqueInput
  }

  /**
   * user_article findFirst
   */
  export type user_articleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter, which user_article to fetch.
     */
    where?: user_articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_articles to fetch.
     */
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_articles.
     */
    cursor?: user_articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_articles.
     */
    distinct?: User_articleScalarFieldEnum | User_articleScalarFieldEnum[]
  }

  /**
   * user_article findFirstOrThrow
   */
  export type user_articleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter, which user_article to fetch.
     */
    where?: user_articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_articles to fetch.
     */
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_articles.
     */
    cursor?: user_articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_articles.
     */
    distinct?: User_articleScalarFieldEnum | User_articleScalarFieldEnum[]
  }

  /**
   * user_article findMany
   */
  export type user_articleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter, which user_articles to fetch.
     */
    where?: user_articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_articles to fetch.
     */
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing user_articles.
     */
    cursor?: user_articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_articles.
     */
    skip?: number
    distinct?: User_articleScalarFieldEnum | User_articleScalarFieldEnum[]
  }

  /**
   * user_article create
   */
  export type user_articleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * The data needed to create a user_article.
     */
    data: XOR<user_articleCreateInput, user_articleUncheckedCreateInput>
  }

  /**
   * user_article createMany
   */
  export type user_articleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many user_articles.
     */
    data: user_articleCreateManyInput | user_articleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_article update
   */
  export type user_articleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * The data needed to update a user_article.
     */
    data: XOR<user_articleUpdateInput, user_articleUncheckedUpdateInput>
    /**
     * Choose, which user_article to update.
     */
    where: user_articleWhereUniqueInput
  }

  /**
   * user_article updateMany
   */
  export type user_articleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update user_articles.
     */
    data: XOR<user_articleUpdateManyMutationInput, user_articleUncheckedUpdateManyInput>
    /**
     * Filter which user_articles to update
     */
    where?: user_articleWhereInput
    /**
     * Limit how many user_articles to update.
     */
    limit?: number
  }

  /**
   * user_article upsert
   */
  export type user_articleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * The filter to search for the user_article to update in case it exists.
     */
    where: user_articleWhereUniqueInput
    /**
     * In case the user_article found by the `where` argument doesn't exist, create a new user_article with this data.
     */
    create: XOR<user_articleCreateInput, user_articleUncheckedCreateInput>
    /**
     * In case the user_article was found with the provided `where` argument, update it with this data.
     */
    update: XOR<user_articleUpdateInput, user_articleUncheckedUpdateInput>
  }

  /**
   * user_article delete
   */
  export type user_articleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    /**
     * Filter which user_article to delete.
     */
    where: user_articleWhereUniqueInput
  }

  /**
   * user_article deleteMany
   */
  export type user_articleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_articles to delete
     */
    where?: user_articleWhereInput
    /**
     * Limit how many user_articles to delete.
     */
    limit?: number
  }

  /**
   * user_article without action
   */
  export type user_articleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
  }


  /**
   * Model article
   */

  export type AggregateArticle = {
    _count: ArticleCountAggregateOutputType | null
    _avg: ArticleAvgAggregateOutputType | null
    _sum: ArticleSumAggregateOutputType | null
    _min: ArticleMinAggregateOutputType | null
    _max: ArticleMaxAggregateOutputType | null
  }

  export type ArticleAvgAggregateOutputType = {
    id: number | null
    anki_note_id: number | null
  }

  export type ArticleSumAggregateOutputType = {
    id: number | null
    anki_note_id: bigint | null
  }

  export type ArticleMinAggregateOutputType = {
    id: number | null
    link: string | null
    create_at: Date | null
    update_at: Date | null
    title: string | null
    quiz_type: string | null
    content: string | null
    content_mindmap: string | null
    user_note: string | null
    gist: string | null
    content_type: string | null
    job_type: string | null
    hard: string | null
    anki_note_id: bigint | null
    time_create: Date | null
    time_update: Date | null
  }

  export type ArticleMaxAggregateOutputType = {
    id: number | null
    link: string | null
    create_at: Date | null
    update_at: Date | null
    title: string | null
    quiz_type: string | null
    content: string | null
    content_mindmap: string | null
    user_note: string | null
    gist: string | null
    content_type: string | null
    job_type: string | null
    hard: string | null
    anki_note_id: bigint | null
    time_create: Date | null
    time_update: Date | null
  }

  export type ArticleCountAggregateOutputType = {
    id: number
    link: number
    create_at: number
    update_at: number
    title: number
    quiz_type: number
    content: number
    content_mindmap: number
    user_note: number
    gist: number
    content_type: number
    job_type: number
    hard: number
    anki_note_id: number
    time_create: number
    time_update: number
    _all: number
  }


  export type ArticleAvgAggregateInputType = {
    id?: true
    anki_note_id?: true
  }

  export type ArticleSumAggregateInputType = {
    id?: true
    anki_note_id?: true
  }

  export type ArticleMinAggregateInputType = {
    id?: true
    link?: true
    create_at?: true
    update_at?: true
    title?: true
    quiz_type?: true
    content?: true
    content_mindmap?: true
    user_note?: true
    gist?: true
    content_type?: true
    job_type?: true
    hard?: true
    anki_note_id?: true
    time_create?: true
    time_update?: true
  }

  export type ArticleMaxAggregateInputType = {
    id?: true
    link?: true
    create_at?: true
    update_at?: true
    title?: true
    quiz_type?: true
    content?: true
    content_mindmap?: true
    user_note?: true
    gist?: true
    content_type?: true
    job_type?: true
    hard?: true
    anki_note_id?: true
    time_create?: true
    time_update?: true
  }

  export type ArticleCountAggregateInputType = {
    id?: true
    link?: true
    create_at?: true
    update_at?: true
    title?: true
    quiz_type?: true
    content?: true
    content_mindmap?: true
    user_note?: true
    gist?: true
    content_type?: true
    job_type?: true
    hard?: true
    anki_note_id?: true
    time_create?: true
    time_update?: true
    _all?: true
  }

  export type ArticleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which article to aggregate.
     */
    where?: articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of articles to fetch.
     */
    orderBy?: articleOrderByWithRelationInput | articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned articles
    **/
    _count?: true | ArticleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ArticleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ArticleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ArticleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ArticleMaxAggregateInputType
  }

  export type GetArticleAggregateType<T extends ArticleAggregateArgs> = {
        [P in keyof T & keyof AggregateArticle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateArticle[P]>
      : GetScalarType<T[P], AggregateArticle[P]>
  }




  export type articleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: articleWhereInput
    orderBy?: articleOrderByWithAggregationInput | articleOrderByWithAggregationInput[]
    by: ArticleScalarFieldEnum[] | ArticleScalarFieldEnum
    having?: articleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ArticleCountAggregateInputType | true
    _avg?: ArticleAvgAggregateInputType
    _sum?: ArticleSumAggregateInputType
    _min?: ArticleMinAggregateInputType
    _max?: ArticleMaxAggregateInputType
  }

  export type ArticleGroupByOutputType = {
    id: number
    link: string
    create_at: Date | null
    update_at: Date | null
    title: string
    quiz_type: string
    content: string
    content_mindmap: string | null
    user_note: string | null
    gist: string
    content_type: string
    job_type: string | null
    hard: string
    anki_note_id: bigint | null
    time_create: Date | null
    time_update: Date | null
    _count: ArticleCountAggregateOutputType | null
    _avg: ArticleAvgAggregateOutputType | null
    _sum: ArticleSumAggregateOutputType | null
    _min: ArticleMinAggregateOutputType | null
    _max: ArticleMaxAggregateOutputType | null
  }

  type GetArticleGroupByPayload<T extends articleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ArticleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ArticleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ArticleGroupByOutputType[P]>
            : GetScalarType<T[P], ArticleGroupByOutputType[P]>
        }
      >
    >


  export type articleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    link?: boolean
    create_at?: boolean
    update_at?: boolean
    title?: boolean
    quiz_type?: boolean
    content?: boolean
    content_mindmap?: boolean
    user_note?: boolean
    gist?: boolean
    content_type?: boolean
    job_type?: boolean
    hard?: boolean
    anki_note_id?: boolean
    time_create?: boolean
    time_update?: boolean
    user_articles?: boolean | article$user_articlesArgs<ExtArgs>
    _count?: boolean | ArticleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["article"]>



  export type articleSelectScalar = {
    id?: boolean
    link?: boolean
    create_at?: boolean
    update_at?: boolean
    title?: boolean
    quiz_type?: boolean
    content?: boolean
    content_mindmap?: boolean
    user_note?: boolean
    gist?: boolean
    content_type?: boolean
    job_type?: boolean
    hard?: boolean
    anki_note_id?: boolean
    time_create?: boolean
    time_update?: boolean
  }

  export type articleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "link" | "create_at" | "update_at" | "title" | "quiz_type" | "content" | "content_mindmap" | "user_note" | "gist" | "content_type" | "job_type" | "hard" | "anki_note_id" | "time_create" | "time_update", ExtArgs["result"]["article"]>
  export type articleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_articles?: boolean | article$user_articlesArgs<ExtArgs>
    _count?: boolean | ArticleCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $articlePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "article"
    objects: {
      user_articles: Prisma.$user_articlePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      link: string
      create_at: Date | null
      update_at: Date | null
      title: string
      quiz_type: string
      content: string
      content_mindmap: string | null
      user_note: string | null
      gist: string
      content_type: string
      job_type: string | null
      hard: string
      anki_note_id: bigint | null
      time_create: Date | null
      time_update: Date | null
    }, ExtArgs["result"]["article"]>
    composites: {}
  }

  type articleGetPayload<S extends boolean | null | undefined | articleDefaultArgs> = $Result.GetResult<Prisma.$articlePayload, S>

  type articleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<articleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ArticleCountAggregateInputType | true
    }

  export interface articleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['article'], meta: { name: 'article' } }
    /**
     * Find zero or one Article that matches the filter.
     * @param {articleFindUniqueArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends articleFindUniqueArgs>(args: SelectSubset<T, articleFindUniqueArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Article that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {articleFindUniqueOrThrowArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends articleFindUniqueOrThrowArgs>(args: SelectSubset<T, articleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Article that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleFindFirstArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends articleFindFirstArgs>(args?: SelectSubset<T, articleFindFirstArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Article that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleFindFirstOrThrowArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends articleFindFirstOrThrowArgs>(args?: SelectSubset<T, articleFindFirstOrThrowArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Articles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Articles
     * const articles = await prisma.article.findMany()
     * 
     * // Get first 10 Articles
     * const articles = await prisma.article.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const articleWithIdOnly = await prisma.article.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends articleFindManyArgs>(args?: SelectSubset<T, articleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Article.
     * @param {articleCreateArgs} args - Arguments to create a Article.
     * @example
     * // Create one Article
     * const Article = await prisma.article.create({
     *   data: {
     *     // ... data to create a Article
     *   }
     * })
     * 
     */
    create<T extends articleCreateArgs>(args: SelectSubset<T, articleCreateArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Articles.
     * @param {articleCreateManyArgs} args - Arguments to create many Articles.
     * @example
     * // Create many Articles
     * const article = await prisma.article.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends articleCreateManyArgs>(args?: SelectSubset<T, articleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Article.
     * @param {articleDeleteArgs} args - Arguments to delete one Article.
     * @example
     * // Delete one Article
     * const Article = await prisma.article.delete({
     *   where: {
     *     // ... filter to delete one Article
     *   }
     * })
     * 
     */
    delete<T extends articleDeleteArgs>(args: SelectSubset<T, articleDeleteArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Article.
     * @param {articleUpdateArgs} args - Arguments to update one Article.
     * @example
     * // Update one Article
     * const article = await prisma.article.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends articleUpdateArgs>(args: SelectSubset<T, articleUpdateArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Articles.
     * @param {articleDeleteManyArgs} args - Arguments to filter Articles to delete.
     * @example
     * // Delete a few Articles
     * const { count } = await prisma.article.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends articleDeleteManyArgs>(args?: SelectSubset<T, articleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Articles
     * const article = await prisma.article.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends articleUpdateManyArgs>(args: SelectSubset<T, articleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Article.
     * @param {articleUpsertArgs} args - Arguments to update or create a Article.
     * @example
     * // Update or create a Article
     * const article = await prisma.article.upsert({
     *   create: {
     *     // ... data to create a Article
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Article we want to update
     *   }
     * })
     */
    upsert<T extends articleUpsertArgs>(args: SelectSubset<T, articleUpsertArgs<ExtArgs>>): Prisma__articleClient<$Result.GetResult<Prisma.$articlePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleCountArgs} args - Arguments to filter Articles to count.
     * @example
     * // Count the number of Articles
     * const count = await prisma.article.count({
     *   where: {
     *     // ... the filter for the Articles we want to count
     *   }
     * })
    **/
    count<T extends articleCountArgs>(
      args?: Subset<T, articleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ArticleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ArticleAggregateArgs>(args: Subset<T, ArticleAggregateArgs>): Prisma.PrismaPromise<GetArticleAggregateType<T>>

    /**
     * Group by Article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {articleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends articleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: articleGroupByArgs['orderBy'] }
        : { orderBy?: articleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, articleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetArticleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the article model
   */
  readonly fields: articleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for article.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__articleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user_articles<T extends article$user_articlesArgs<ExtArgs> = {}>(args?: Subset<T, article$user_articlesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_articlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the article model
   */
  interface articleFieldRefs {
    readonly id: FieldRef<"article", 'Int'>
    readonly link: FieldRef<"article", 'String'>
    readonly create_at: FieldRef<"article", 'DateTime'>
    readonly update_at: FieldRef<"article", 'DateTime'>
    readonly title: FieldRef<"article", 'String'>
    readonly quiz_type: FieldRef<"article", 'String'>
    readonly content: FieldRef<"article", 'String'>
    readonly content_mindmap: FieldRef<"article", 'String'>
    readonly user_note: FieldRef<"article", 'String'>
    readonly gist: FieldRef<"article", 'String'>
    readonly content_type: FieldRef<"article", 'String'>
    readonly job_type: FieldRef<"article", 'String'>
    readonly hard: FieldRef<"article", 'String'>
    readonly anki_note_id: FieldRef<"article", 'BigInt'>
    readonly time_create: FieldRef<"article", 'DateTime'>
    readonly time_update: FieldRef<"article", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * article findUnique
   */
  export type articleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter, which article to fetch.
     */
    where: articleWhereUniqueInput
  }

  /**
   * article findUniqueOrThrow
   */
  export type articleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter, which article to fetch.
     */
    where: articleWhereUniqueInput
  }

  /**
   * article findFirst
   */
  export type articleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter, which article to fetch.
     */
    where?: articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of articles to fetch.
     */
    orderBy?: articleOrderByWithRelationInput | articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for articles.
     */
    cursor?: articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of articles.
     */
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * article findFirstOrThrow
   */
  export type articleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter, which article to fetch.
     */
    where?: articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of articles to fetch.
     */
    orderBy?: articleOrderByWithRelationInput | articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for articles.
     */
    cursor?: articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of articles.
     */
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * article findMany
   */
  export type articleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter, which articles to fetch.
     */
    where?: articleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of articles to fetch.
     */
    orderBy?: articleOrderByWithRelationInput | articleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing articles.
     */
    cursor?: articleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` articles.
     */
    skip?: number
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * article create
   */
  export type articleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * The data needed to create a article.
     */
    data: XOR<articleCreateInput, articleUncheckedCreateInput>
  }

  /**
   * article createMany
   */
  export type articleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many articles.
     */
    data: articleCreateManyInput | articleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * article update
   */
  export type articleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * The data needed to update a article.
     */
    data: XOR<articleUpdateInput, articleUncheckedUpdateInput>
    /**
     * Choose, which article to update.
     */
    where: articleWhereUniqueInput
  }

  /**
   * article updateMany
   */
  export type articleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update articles.
     */
    data: XOR<articleUpdateManyMutationInput, articleUncheckedUpdateManyInput>
    /**
     * Filter which articles to update
     */
    where?: articleWhereInput
    /**
     * Limit how many articles to update.
     */
    limit?: number
  }

  /**
   * article upsert
   */
  export type articleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * The filter to search for the article to update in case it exists.
     */
    where: articleWhereUniqueInput
    /**
     * In case the article found by the `where` argument doesn't exist, create a new article with this data.
     */
    create: XOR<articleCreateInput, articleUncheckedCreateInput>
    /**
     * In case the article was found with the provided `where` argument, update it with this data.
     */
    update: XOR<articleUpdateInput, articleUncheckedUpdateInput>
  }

  /**
   * article delete
   */
  export type articleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
    /**
     * Filter which article to delete.
     */
    where: articleWhereUniqueInput
  }

  /**
   * article deleteMany
   */
  export type articleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which articles to delete
     */
    where?: articleWhereInput
    /**
     * Limit how many articles to delete.
     */
    limit?: number
  }

  /**
   * article.user_articles
   */
  export type article$user_articlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_article
     */
    select?: user_articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_article
     */
    omit?: user_articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_articleInclude<ExtArgs> | null
    where?: user_articleWhereInput
    orderBy?: user_articleOrderByWithRelationInput | user_articleOrderByWithRelationInput[]
    cursor?: user_articleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: User_articleScalarFieldEnum | User_articleScalarFieldEnum[]
  }

  /**
   * article without action
   */
  export type articleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the article
     */
    select?: articleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the article
     */
    omit?: articleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: articleInclude<ExtArgs> | null
  }


  /**
   * Model user_project
   */

  export type AggregateUser_project = {
    _count: User_projectCountAggregateOutputType | null
    _avg: User_projectAvgAggregateOutputType | null
    _sum: User_projectSumAggregateOutputType | null
    _min: User_projectMinAggregateOutputType | null
    _max: User_projectMaxAggregateOutputType | null
  }

  export type User_projectAvgAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type User_projectSumAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type User_projectMinAggregateOutputType = {
    id: number | null
    user_id: number | null
    project_name: string | null
  }

  export type User_projectMaxAggregateOutputType = {
    id: number | null
    user_id: number | null
    project_name: string | null
  }

  export type User_projectCountAggregateOutputType = {
    id: number
    user_id: number
    project_name: number
    _all: number
  }


  export type User_projectAvgAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type User_projectSumAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type User_projectMinAggregateInputType = {
    id?: true
    user_id?: true
    project_name?: true
  }

  export type User_projectMaxAggregateInputType = {
    id?: true
    user_id?: true
    project_name?: true
  }

  export type User_projectCountAggregateInputType = {
    id?: true
    user_id?: true
    project_name?: true
    _all?: true
  }

  export type User_projectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_project to aggregate.
     */
    where?: user_projectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_projects to fetch.
     */
    orderBy?: user_projectOrderByWithRelationInput | user_projectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: user_projectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned user_projects
    **/
    _count?: true | User_projectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: User_projectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: User_projectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: User_projectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: User_projectMaxAggregateInputType
  }

  export type GetUser_projectAggregateType<T extends User_projectAggregateArgs> = {
        [P in keyof T & keyof AggregateUser_project]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser_project[P]>
      : GetScalarType<T[P], AggregateUser_project[P]>
  }




  export type user_projectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_projectWhereInput
    orderBy?: user_projectOrderByWithAggregationInput | user_projectOrderByWithAggregationInput[]
    by: User_projectScalarFieldEnum[] | User_projectScalarFieldEnum
    having?: user_projectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: User_projectCountAggregateInputType | true
    _avg?: User_projectAvgAggregateInputType
    _sum?: User_projectSumAggregateInputType
    _min?: User_projectMinAggregateInputType
    _max?: User_projectMaxAggregateInputType
  }

  export type User_projectGroupByOutputType = {
    id: number
    user_id: number
    project_name: string
    _count: User_projectCountAggregateOutputType | null
    _avg: User_projectAvgAggregateOutputType | null
    _sum: User_projectSumAggregateOutputType | null
    _min: User_projectMinAggregateOutputType | null
    _max: User_projectMaxAggregateOutputType | null
  }

  type GetUser_projectGroupByPayload<T extends user_projectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<User_projectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof User_projectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], User_projectGroupByOutputType[P]>
            : GetScalarType<T[P], User_projectGroupByOutputType[P]>
        }
      >
    >


  export type user_projectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    project_name?: boolean
    project_file?: boolean | user_project$project_fileArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
    _count?: boolean | User_projectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user_project"]>



  export type user_projectSelectScalar = {
    id?: boolean
    user_id?: boolean
    project_name?: boolean
  }

  export type user_projectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "project_name", ExtArgs["result"]["user_project"]>
  export type user_projectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project_file?: boolean | user_project$project_fileArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
    _count?: boolean | User_projectCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $user_projectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user_project"
    objects: {
      project_file: Prisma.$project_filePayload<ExtArgs>[]
      user: Prisma.$userPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      user_id: number
      project_name: string
    }, ExtArgs["result"]["user_project"]>
    composites: {}
  }

  type user_projectGetPayload<S extends boolean | null | undefined | user_projectDefaultArgs> = $Result.GetResult<Prisma.$user_projectPayload, S>

  type user_projectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<user_projectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: User_projectCountAggregateInputType | true
    }

  export interface user_projectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user_project'], meta: { name: 'user_project' } }
    /**
     * Find zero or one User_project that matches the filter.
     * @param {user_projectFindUniqueArgs} args - Arguments to find a User_project
     * @example
     * // Get one User_project
     * const user_project = await prisma.user_project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends user_projectFindUniqueArgs>(args: SelectSubset<T, user_projectFindUniqueArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User_project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {user_projectFindUniqueOrThrowArgs} args - Arguments to find a User_project
     * @example
     * // Get one User_project
     * const user_project = await prisma.user_project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends user_projectFindUniqueOrThrowArgs>(args: SelectSubset<T, user_projectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectFindFirstArgs} args - Arguments to find a User_project
     * @example
     * // Get one User_project
     * const user_project = await prisma.user_project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends user_projectFindFirstArgs>(args?: SelectSubset<T, user_projectFindFirstArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectFindFirstOrThrowArgs} args - Arguments to find a User_project
     * @example
     * // Get one User_project
     * const user_project = await prisma.user_project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends user_projectFindFirstOrThrowArgs>(args?: SelectSubset<T, user_projectFindFirstOrThrowArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more User_projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all User_projects
     * const user_projects = await prisma.user_project.findMany()
     * 
     * // Get first 10 User_projects
     * const user_projects = await prisma.user_project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const user_projectWithIdOnly = await prisma.user_project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends user_projectFindManyArgs>(args?: SelectSubset<T, user_projectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User_project.
     * @param {user_projectCreateArgs} args - Arguments to create a User_project.
     * @example
     * // Create one User_project
     * const User_project = await prisma.user_project.create({
     *   data: {
     *     // ... data to create a User_project
     *   }
     * })
     * 
     */
    create<T extends user_projectCreateArgs>(args: SelectSubset<T, user_projectCreateArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many User_projects.
     * @param {user_projectCreateManyArgs} args - Arguments to create many User_projects.
     * @example
     * // Create many User_projects
     * const user_project = await prisma.user_project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends user_projectCreateManyArgs>(args?: SelectSubset<T, user_projectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User_project.
     * @param {user_projectDeleteArgs} args - Arguments to delete one User_project.
     * @example
     * // Delete one User_project
     * const User_project = await prisma.user_project.delete({
     *   where: {
     *     // ... filter to delete one User_project
     *   }
     * })
     * 
     */
    delete<T extends user_projectDeleteArgs>(args: SelectSubset<T, user_projectDeleteArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User_project.
     * @param {user_projectUpdateArgs} args - Arguments to update one User_project.
     * @example
     * // Update one User_project
     * const user_project = await prisma.user_project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends user_projectUpdateArgs>(args: SelectSubset<T, user_projectUpdateArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more User_projects.
     * @param {user_projectDeleteManyArgs} args - Arguments to filter User_projects to delete.
     * @example
     * // Delete a few User_projects
     * const { count } = await prisma.user_project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends user_projectDeleteManyArgs>(args?: SelectSubset<T, user_projectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many User_projects
     * const user_project = await prisma.user_project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends user_projectUpdateManyArgs>(args: SelectSubset<T, user_projectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User_project.
     * @param {user_projectUpsertArgs} args - Arguments to update or create a User_project.
     * @example
     * // Update or create a User_project
     * const user_project = await prisma.user_project.upsert({
     *   create: {
     *     // ... data to create a User_project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User_project we want to update
     *   }
     * })
     */
    upsert<T extends user_projectUpsertArgs>(args: SelectSubset<T, user_projectUpsertArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of User_projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectCountArgs} args - Arguments to filter User_projects to count.
     * @example
     * // Count the number of User_projects
     * const count = await prisma.user_project.count({
     *   where: {
     *     // ... the filter for the User_projects we want to count
     *   }
     * })
    **/
    count<T extends user_projectCountArgs>(
      args?: Subset<T, user_projectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], User_projectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User_project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {User_projectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends User_projectAggregateArgs>(args: Subset<T, User_projectAggregateArgs>): Prisma.PrismaPromise<GetUser_projectAggregateType<T>>

    /**
     * Group by User_project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_projectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends user_projectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: user_projectGroupByArgs['orderBy'] }
        : { orderBy?: user_projectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, user_projectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUser_projectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user_project model
   */
  readonly fields: user_projectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user_project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__user_projectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project_file<T extends user_project$project_fileArgs<ExtArgs> = {}>(args?: Subset<T, user_project$project_fileArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends userDefaultArgs<ExtArgs> = {}>(args?: Subset<T, userDefaultArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user_project model
   */
  interface user_projectFieldRefs {
    readonly id: FieldRef<"user_project", 'Int'>
    readonly user_id: FieldRef<"user_project", 'Int'>
    readonly project_name: FieldRef<"user_project", 'String'>
  }
    

  // Custom InputTypes
  /**
   * user_project findUnique
   */
  export type user_projectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter, which user_project to fetch.
     */
    where: user_projectWhereUniqueInput
  }

  /**
   * user_project findUniqueOrThrow
   */
  export type user_projectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter, which user_project to fetch.
     */
    where: user_projectWhereUniqueInput
  }

  /**
   * user_project findFirst
   */
  export type user_projectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter, which user_project to fetch.
     */
    where?: user_projectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_projects to fetch.
     */
    orderBy?: user_projectOrderByWithRelationInput | user_projectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_projects.
     */
    cursor?: user_projectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_projects.
     */
    distinct?: User_projectScalarFieldEnum | User_projectScalarFieldEnum[]
  }

  /**
   * user_project findFirstOrThrow
   */
  export type user_projectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter, which user_project to fetch.
     */
    where?: user_projectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_projects to fetch.
     */
    orderBy?: user_projectOrderByWithRelationInput | user_projectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_projects.
     */
    cursor?: user_projectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_projects.
     */
    distinct?: User_projectScalarFieldEnum | User_projectScalarFieldEnum[]
  }

  /**
   * user_project findMany
   */
  export type user_projectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter, which user_projects to fetch.
     */
    where?: user_projectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_projects to fetch.
     */
    orderBy?: user_projectOrderByWithRelationInput | user_projectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing user_projects.
     */
    cursor?: user_projectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_projects.
     */
    skip?: number
    distinct?: User_projectScalarFieldEnum | User_projectScalarFieldEnum[]
  }

  /**
   * user_project create
   */
  export type user_projectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * The data needed to create a user_project.
     */
    data: XOR<user_projectCreateInput, user_projectUncheckedCreateInput>
  }

  /**
   * user_project createMany
   */
  export type user_projectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many user_projects.
     */
    data: user_projectCreateManyInput | user_projectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_project update
   */
  export type user_projectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * The data needed to update a user_project.
     */
    data: XOR<user_projectUpdateInput, user_projectUncheckedUpdateInput>
    /**
     * Choose, which user_project to update.
     */
    where: user_projectWhereUniqueInput
  }

  /**
   * user_project updateMany
   */
  export type user_projectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update user_projects.
     */
    data: XOR<user_projectUpdateManyMutationInput, user_projectUncheckedUpdateManyInput>
    /**
     * Filter which user_projects to update
     */
    where?: user_projectWhereInput
    /**
     * Limit how many user_projects to update.
     */
    limit?: number
  }

  /**
   * user_project upsert
   */
  export type user_projectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * The filter to search for the user_project to update in case it exists.
     */
    where: user_projectWhereUniqueInput
    /**
     * In case the user_project found by the `where` argument doesn't exist, create a new user_project with this data.
     */
    create: XOR<user_projectCreateInput, user_projectUncheckedCreateInput>
    /**
     * In case the user_project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<user_projectUpdateInput, user_projectUncheckedUpdateInput>
  }

  /**
   * user_project delete
   */
  export type user_projectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
    /**
     * Filter which user_project to delete.
     */
    where: user_projectWhereUniqueInput
  }

  /**
   * user_project deleteMany
   */
  export type user_projectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_projects to delete
     */
    where?: user_projectWhereInput
    /**
     * Limit how many user_projects to delete.
     */
    limit?: number
  }

  /**
   * user_project.project_file
   */
  export type user_project$project_fileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    where?: project_fileWhereInput
    orderBy?: project_fileOrderByWithRelationInput | project_fileOrderByWithRelationInput[]
    cursor?: project_fileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Project_fileScalarFieldEnum | Project_fileScalarFieldEnum[]
  }

  /**
   * user_project without action
   */
  export type user_projectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_project
     */
    select?: user_projectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_project
     */
    omit?: user_projectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_projectInclude<ExtArgs> | null
  }


  /**
   * Model project_file
   */

  export type AggregateProject_file = {
    _count: Project_fileCountAggregateOutputType | null
    _avg: Project_fileAvgAggregateOutputType | null
    _sum: Project_fileSumAggregateOutputType | null
    _min: Project_fileMinAggregateOutputType | null
    _max: Project_fileMaxAggregateOutputType | null
  }

  export type Project_fileAvgAggregateOutputType = {
    id: number | null
    user_project_id: number | null
  }

  export type Project_fileSumAggregateOutputType = {
    id: number | null
    user_project_id: number | null
  }

  export type Project_fileMinAggregateOutputType = {
    id: number | null
    file_path: string | null
    hash: string | null
    user_project_id: number | null
  }

  export type Project_fileMaxAggregateOutputType = {
    id: number | null
    file_path: string | null
    hash: string | null
    user_project_id: number | null
  }

  export type Project_fileCountAggregateOutputType = {
    id: number
    file_path: number
    hash: number
    user_project_id: number
    _all: number
  }


  export type Project_fileAvgAggregateInputType = {
    id?: true
    user_project_id?: true
  }

  export type Project_fileSumAggregateInputType = {
    id?: true
    user_project_id?: true
  }

  export type Project_fileMinAggregateInputType = {
    id?: true
    file_path?: true
    hash?: true
    user_project_id?: true
  }

  export type Project_fileMaxAggregateInputType = {
    id?: true
    file_path?: true
    hash?: true
    user_project_id?: true
  }

  export type Project_fileCountAggregateInputType = {
    id?: true
    file_path?: true
    hash?: true
    user_project_id?: true
    _all?: true
  }

  export type Project_fileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which project_file to aggregate.
     */
    where?: project_fileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_files to fetch.
     */
    orderBy?: project_fileOrderByWithRelationInput | project_fileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: project_fileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned project_files
    **/
    _count?: true | Project_fileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Project_fileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Project_fileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Project_fileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Project_fileMaxAggregateInputType
  }

  export type GetProject_fileAggregateType<T extends Project_fileAggregateArgs> = {
        [P in keyof T & keyof AggregateProject_file]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject_file[P]>
      : GetScalarType<T[P], AggregateProject_file[P]>
  }




  export type project_fileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: project_fileWhereInput
    orderBy?: project_fileOrderByWithAggregationInput | project_fileOrderByWithAggregationInput[]
    by: Project_fileScalarFieldEnum[] | Project_fileScalarFieldEnum
    having?: project_fileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Project_fileCountAggregateInputType | true
    _avg?: Project_fileAvgAggregateInputType
    _sum?: Project_fileSumAggregateInputType
    _min?: Project_fileMinAggregateInputType
    _max?: Project_fileMaxAggregateInputType
  }

  export type Project_fileGroupByOutputType = {
    id: number
    file_path: string
    hash: string
    user_project_id: number
    _count: Project_fileCountAggregateOutputType | null
    _avg: Project_fileAvgAggregateOutputType | null
    _sum: Project_fileSumAggregateOutputType | null
    _min: Project_fileMinAggregateOutputType | null
    _max: Project_fileMaxAggregateOutputType | null
  }

  type GetProject_fileGroupByPayload<T extends project_fileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Project_fileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Project_fileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Project_fileGroupByOutputType[P]>
            : GetScalarType<T[P], Project_fileGroupByOutputType[P]>
        }
      >
    >


  export type project_fileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    file_path?: boolean
    hash?: boolean
    user_project_id?: boolean
    user_project?: boolean | user_projectDefaultArgs<ExtArgs>
    chunks?: boolean | project_file$chunksArgs<ExtArgs>
    _count?: boolean | Project_fileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project_file"]>



  export type project_fileSelectScalar = {
    id?: boolean
    file_path?: boolean
    hash?: boolean
    user_project_id?: boolean
  }

  export type project_fileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "file_path" | "hash" | "user_project_id", ExtArgs["result"]["project_file"]>
  export type project_fileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_project?: boolean | user_projectDefaultArgs<ExtArgs>
    chunks?: boolean | project_file$chunksArgs<ExtArgs>
    _count?: boolean | Project_fileCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $project_filePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "project_file"
    objects: {
      user_project: Prisma.$user_projectPayload<ExtArgs>
      chunks: Prisma.$project_file_chunkPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      file_path: string
      hash: string
      user_project_id: number
    }, ExtArgs["result"]["project_file"]>
    composites: {}
  }

  type project_fileGetPayload<S extends boolean | null | undefined | project_fileDefaultArgs> = $Result.GetResult<Prisma.$project_filePayload, S>

  type project_fileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<project_fileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Project_fileCountAggregateInputType | true
    }

  export interface project_fileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['project_file'], meta: { name: 'project_file' } }
    /**
     * Find zero or one Project_file that matches the filter.
     * @param {project_fileFindUniqueArgs} args - Arguments to find a Project_file
     * @example
     * // Get one Project_file
     * const project_file = await prisma.project_file.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends project_fileFindUniqueArgs>(args: SelectSubset<T, project_fileFindUniqueArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project_file that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {project_fileFindUniqueOrThrowArgs} args - Arguments to find a Project_file
     * @example
     * // Get one Project_file
     * const project_file = await prisma.project_file.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends project_fileFindUniqueOrThrowArgs>(args: SelectSubset<T, project_fileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project_file that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileFindFirstArgs} args - Arguments to find a Project_file
     * @example
     * // Get one Project_file
     * const project_file = await prisma.project_file.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends project_fileFindFirstArgs>(args?: SelectSubset<T, project_fileFindFirstArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project_file that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileFindFirstOrThrowArgs} args - Arguments to find a Project_file
     * @example
     * // Get one Project_file
     * const project_file = await prisma.project_file.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends project_fileFindFirstOrThrowArgs>(args?: SelectSubset<T, project_fileFindFirstOrThrowArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Project_files that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Project_files
     * const project_files = await prisma.project_file.findMany()
     * 
     * // Get first 10 Project_files
     * const project_files = await prisma.project_file.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const project_fileWithIdOnly = await prisma.project_file.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends project_fileFindManyArgs>(args?: SelectSubset<T, project_fileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project_file.
     * @param {project_fileCreateArgs} args - Arguments to create a Project_file.
     * @example
     * // Create one Project_file
     * const Project_file = await prisma.project_file.create({
     *   data: {
     *     // ... data to create a Project_file
     *   }
     * })
     * 
     */
    create<T extends project_fileCreateArgs>(args: SelectSubset<T, project_fileCreateArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Project_files.
     * @param {project_fileCreateManyArgs} args - Arguments to create many Project_files.
     * @example
     * // Create many Project_files
     * const project_file = await prisma.project_file.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends project_fileCreateManyArgs>(args?: SelectSubset<T, project_fileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Project_file.
     * @param {project_fileDeleteArgs} args - Arguments to delete one Project_file.
     * @example
     * // Delete one Project_file
     * const Project_file = await prisma.project_file.delete({
     *   where: {
     *     // ... filter to delete one Project_file
     *   }
     * })
     * 
     */
    delete<T extends project_fileDeleteArgs>(args: SelectSubset<T, project_fileDeleteArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project_file.
     * @param {project_fileUpdateArgs} args - Arguments to update one Project_file.
     * @example
     * // Update one Project_file
     * const project_file = await prisma.project_file.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends project_fileUpdateArgs>(args: SelectSubset<T, project_fileUpdateArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Project_files.
     * @param {project_fileDeleteManyArgs} args - Arguments to filter Project_files to delete.
     * @example
     * // Delete a few Project_files
     * const { count } = await prisma.project_file.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends project_fileDeleteManyArgs>(args?: SelectSubset<T, project_fileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Project_files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Project_files
     * const project_file = await prisma.project_file.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends project_fileUpdateManyArgs>(args: SelectSubset<T, project_fileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Project_file.
     * @param {project_fileUpsertArgs} args - Arguments to update or create a Project_file.
     * @example
     * // Update or create a Project_file
     * const project_file = await prisma.project_file.upsert({
     *   create: {
     *     // ... data to create a Project_file
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project_file we want to update
     *   }
     * })
     */
    upsert<T extends project_fileUpsertArgs>(args: SelectSubset<T, project_fileUpsertArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Project_files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileCountArgs} args - Arguments to filter Project_files to count.
     * @example
     * // Count the number of Project_files
     * const count = await prisma.project_file.count({
     *   where: {
     *     // ... the filter for the Project_files we want to count
     *   }
     * })
    **/
    count<T extends project_fileCountArgs>(
      args?: Subset<T, project_fileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Project_fileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project_file.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Project_fileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Project_fileAggregateArgs>(args: Subset<T, Project_fileAggregateArgs>): Prisma.PrismaPromise<GetProject_fileAggregateType<T>>

    /**
     * Group by Project_file.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_fileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends project_fileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: project_fileGroupByArgs['orderBy'] }
        : { orderBy?: project_fileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, project_fileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProject_fileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the project_file model
   */
  readonly fields: project_fileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for project_file.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__project_fileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user_project<T extends user_projectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, user_projectDefaultArgs<ExtArgs>>): Prisma__user_projectClient<$Result.GetResult<Prisma.$user_projectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    chunks<T extends project_file$chunksArgs<ExtArgs> = {}>(args?: Subset<T, project_file$chunksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the project_file model
   */
  interface project_fileFieldRefs {
    readonly id: FieldRef<"project_file", 'Int'>
    readonly file_path: FieldRef<"project_file", 'String'>
    readonly hash: FieldRef<"project_file", 'String'>
    readonly user_project_id: FieldRef<"project_file", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * project_file findUnique
   */
  export type project_fileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter, which project_file to fetch.
     */
    where: project_fileWhereUniqueInput
  }

  /**
   * project_file findUniqueOrThrow
   */
  export type project_fileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter, which project_file to fetch.
     */
    where: project_fileWhereUniqueInput
  }

  /**
   * project_file findFirst
   */
  export type project_fileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter, which project_file to fetch.
     */
    where?: project_fileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_files to fetch.
     */
    orderBy?: project_fileOrderByWithRelationInput | project_fileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for project_files.
     */
    cursor?: project_fileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of project_files.
     */
    distinct?: Project_fileScalarFieldEnum | Project_fileScalarFieldEnum[]
  }

  /**
   * project_file findFirstOrThrow
   */
  export type project_fileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter, which project_file to fetch.
     */
    where?: project_fileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_files to fetch.
     */
    orderBy?: project_fileOrderByWithRelationInput | project_fileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for project_files.
     */
    cursor?: project_fileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of project_files.
     */
    distinct?: Project_fileScalarFieldEnum | Project_fileScalarFieldEnum[]
  }

  /**
   * project_file findMany
   */
  export type project_fileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter, which project_files to fetch.
     */
    where?: project_fileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_files to fetch.
     */
    orderBy?: project_fileOrderByWithRelationInput | project_fileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing project_files.
     */
    cursor?: project_fileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_files.
     */
    skip?: number
    distinct?: Project_fileScalarFieldEnum | Project_fileScalarFieldEnum[]
  }

  /**
   * project_file create
   */
  export type project_fileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * The data needed to create a project_file.
     */
    data: XOR<project_fileCreateInput, project_fileUncheckedCreateInput>
  }

  /**
   * project_file createMany
   */
  export type project_fileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many project_files.
     */
    data: project_fileCreateManyInput | project_fileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * project_file update
   */
  export type project_fileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * The data needed to update a project_file.
     */
    data: XOR<project_fileUpdateInput, project_fileUncheckedUpdateInput>
    /**
     * Choose, which project_file to update.
     */
    where: project_fileWhereUniqueInput
  }

  /**
   * project_file updateMany
   */
  export type project_fileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update project_files.
     */
    data: XOR<project_fileUpdateManyMutationInput, project_fileUncheckedUpdateManyInput>
    /**
     * Filter which project_files to update
     */
    where?: project_fileWhereInput
    /**
     * Limit how many project_files to update.
     */
    limit?: number
  }

  /**
   * project_file upsert
   */
  export type project_fileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * The filter to search for the project_file to update in case it exists.
     */
    where: project_fileWhereUniqueInput
    /**
     * In case the project_file found by the `where` argument doesn't exist, create a new project_file with this data.
     */
    create: XOR<project_fileCreateInput, project_fileUncheckedCreateInput>
    /**
     * In case the project_file was found with the provided `where` argument, update it with this data.
     */
    update: XOR<project_fileUpdateInput, project_fileUncheckedUpdateInput>
  }

  /**
   * project_file delete
   */
  export type project_fileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
    /**
     * Filter which project_file to delete.
     */
    where: project_fileWhereUniqueInput
  }

  /**
   * project_file deleteMany
   */
  export type project_fileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which project_files to delete
     */
    where?: project_fileWhereInput
    /**
     * Limit how many project_files to delete.
     */
    limit?: number
  }

  /**
   * project_file.chunks
   */
  export type project_file$chunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    where?: project_file_chunkWhereInput
    orderBy?: project_file_chunkOrderByWithRelationInput | project_file_chunkOrderByWithRelationInput[]
    cursor?: project_file_chunkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Project_file_chunkScalarFieldEnum | Project_file_chunkScalarFieldEnum[]
  }

  /**
   * project_file without action
   */
  export type project_fileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file
     */
    select?: project_fileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file
     */
    omit?: project_fileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_fileInclude<ExtArgs> | null
  }


  /**
   * Model project_file_chunk
   */

  export type AggregateProject_file_chunk = {
    _count: Project_file_chunkCountAggregateOutputType | null
    _avg: Project_file_chunkAvgAggregateOutputType | null
    _sum: Project_file_chunkSumAggregateOutputType | null
    _min: Project_file_chunkMinAggregateOutputType | null
    _max: Project_file_chunkMaxAggregateOutputType | null
  }

  export type Project_file_chunkAvgAggregateOutputType = {
    id: number | null
    project_file_id: number | null
  }

  export type Project_file_chunkSumAggregateOutputType = {
    id: number | null
    project_file_id: number | null
  }

  export type Project_file_chunkMinAggregateOutputType = {
    id: number | null
    project_file_id: number | null
    vector_id: string | null
  }

  export type Project_file_chunkMaxAggregateOutputType = {
    id: number | null
    project_file_id: number | null
    vector_id: string | null
  }

  export type Project_file_chunkCountAggregateOutputType = {
    id: number
    project_file_id: number
    vector_id: number
    _all: number
  }


  export type Project_file_chunkAvgAggregateInputType = {
    id?: true
    project_file_id?: true
  }

  export type Project_file_chunkSumAggregateInputType = {
    id?: true
    project_file_id?: true
  }

  export type Project_file_chunkMinAggregateInputType = {
    id?: true
    project_file_id?: true
    vector_id?: true
  }

  export type Project_file_chunkMaxAggregateInputType = {
    id?: true
    project_file_id?: true
    vector_id?: true
  }

  export type Project_file_chunkCountAggregateInputType = {
    id?: true
    project_file_id?: true
    vector_id?: true
    _all?: true
  }

  export type Project_file_chunkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which project_file_chunk to aggregate.
     */
    where?: project_file_chunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_file_chunks to fetch.
     */
    orderBy?: project_file_chunkOrderByWithRelationInput | project_file_chunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: project_file_chunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_file_chunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_file_chunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned project_file_chunks
    **/
    _count?: true | Project_file_chunkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Project_file_chunkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Project_file_chunkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Project_file_chunkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Project_file_chunkMaxAggregateInputType
  }

  export type GetProject_file_chunkAggregateType<T extends Project_file_chunkAggregateArgs> = {
        [P in keyof T & keyof AggregateProject_file_chunk]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject_file_chunk[P]>
      : GetScalarType<T[P], AggregateProject_file_chunk[P]>
  }




  export type project_file_chunkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: project_file_chunkWhereInput
    orderBy?: project_file_chunkOrderByWithAggregationInput | project_file_chunkOrderByWithAggregationInput[]
    by: Project_file_chunkScalarFieldEnum[] | Project_file_chunkScalarFieldEnum
    having?: project_file_chunkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Project_file_chunkCountAggregateInputType | true
    _avg?: Project_file_chunkAvgAggregateInputType
    _sum?: Project_file_chunkSumAggregateInputType
    _min?: Project_file_chunkMinAggregateInputType
    _max?: Project_file_chunkMaxAggregateInputType
  }

  export type Project_file_chunkGroupByOutputType = {
    id: number
    project_file_id: number
    vector_id: string
    _count: Project_file_chunkCountAggregateOutputType | null
    _avg: Project_file_chunkAvgAggregateOutputType | null
    _sum: Project_file_chunkSumAggregateOutputType | null
    _min: Project_file_chunkMinAggregateOutputType | null
    _max: Project_file_chunkMaxAggregateOutputType | null
  }

  type GetProject_file_chunkGroupByPayload<T extends project_file_chunkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Project_file_chunkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Project_file_chunkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Project_file_chunkGroupByOutputType[P]>
            : GetScalarType<T[P], Project_file_chunkGroupByOutputType[P]>
        }
      >
    >


  export type project_file_chunkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    project_file_id?: boolean
    vector_id?: boolean
    project_file?: boolean | project_fileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project_file_chunk"]>



  export type project_file_chunkSelectScalar = {
    id?: boolean
    project_file_id?: boolean
    vector_id?: boolean
  }

  export type project_file_chunkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "project_file_id" | "vector_id", ExtArgs["result"]["project_file_chunk"]>
  export type project_file_chunkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project_file?: boolean | project_fileDefaultArgs<ExtArgs>
  }

  export type $project_file_chunkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "project_file_chunk"
    objects: {
      project_file: Prisma.$project_filePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      project_file_id: number
      vector_id: string
    }, ExtArgs["result"]["project_file_chunk"]>
    composites: {}
  }

  type project_file_chunkGetPayload<S extends boolean | null | undefined | project_file_chunkDefaultArgs> = $Result.GetResult<Prisma.$project_file_chunkPayload, S>

  type project_file_chunkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<project_file_chunkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Project_file_chunkCountAggregateInputType | true
    }

  export interface project_file_chunkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['project_file_chunk'], meta: { name: 'project_file_chunk' } }
    /**
     * Find zero or one Project_file_chunk that matches the filter.
     * @param {project_file_chunkFindUniqueArgs} args - Arguments to find a Project_file_chunk
     * @example
     * // Get one Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends project_file_chunkFindUniqueArgs>(args: SelectSubset<T, project_file_chunkFindUniqueArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project_file_chunk that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {project_file_chunkFindUniqueOrThrowArgs} args - Arguments to find a Project_file_chunk
     * @example
     * // Get one Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends project_file_chunkFindUniqueOrThrowArgs>(args: SelectSubset<T, project_file_chunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project_file_chunk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkFindFirstArgs} args - Arguments to find a Project_file_chunk
     * @example
     * // Get one Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends project_file_chunkFindFirstArgs>(args?: SelectSubset<T, project_file_chunkFindFirstArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project_file_chunk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkFindFirstOrThrowArgs} args - Arguments to find a Project_file_chunk
     * @example
     * // Get one Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends project_file_chunkFindFirstOrThrowArgs>(args?: SelectSubset<T, project_file_chunkFindFirstOrThrowArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Project_file_chunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Project_file_chunks
     * const project_file_chunks = await prisma.project_file_chunk.findMany()
     * 
     * // Get first 10 Project_file_chunks
     * const project_file_chunks = await prisma.project_file_chunk.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const project_file_chunkWithIdOnly = await prisma.project_file_chunk.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends project_file_chunkFindManyArgs>(args?: SelectSubset<T, project_file_chunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project_file_chunk.
     * @param {project_file_chunkCreateArgs} args - Arguments to create a Project_file_chunk.
     * @example
     * // Create one Project_file_chunk
     * const Project_file_chunk = await prisma.project_file_chunk.create({
     *   data: {
     *     // ... data to create a Project_file_chunk
     *   }
     * })
     * 
     */
    create<T extends project_file_chunkCreateArgs>(args: SelectSubset<T, project_file_chunkCreateArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Project_file_chunks.
     * @param {project_file_chunkCreateManyArgs} args - Arguments to create many Project_file_chunks.
     * @example
     * // Create many Project_file_chunks
     * const project_file_chunk = await prisma.project_file_chunk.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends project_file_chunkCreateManyArgs>(args?: SelectSubset<T, project_file_chunkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Project_file_chunk.
     * @param {project_file_chunkDeleteArgs} args - Arguments to delete one Project_file_chunk.
     * @example
     * // Delete one Project_file_chunk
     * const Project_file_chunk = await prisma.project_file_chunk.delete({
     *   where: {
     *     // ... filter to delete one Project_file_chunk
     *   }
     * })
     * 
     */
    delete<T extends project_file_chunkDeleteArgs>(args: SelectSubset<T, project_file_chunkDeleteArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project_file_chunk.
     * @param {project_file_chunkUpdateArgs} args - Arguments to update one Project_file_chunk.
     * @example
     * // Update one Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends project_file_chunkUpdateArgs>(args: SelectSubset<T, project_file_chunkUpdateArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Project_file_chunks.
     * @param {project_file_chunkDeleteManyArgs} args - Arguments to filter Project_file_chunks to delete.
     * @example
     * // Delete a few Project_file_chunks
     * const { count } = await prisma.project_file_chunk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends project_file_chunkDeleteManyArgs>(args?: SelectSubset<T, project_file_chunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Project_file_chunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Project_file_chunks
     * const project_file_chunk = await prisma.project_file_chunk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends project_file_chunkUpdateManyArgs>(args: SelectSubset<T, project_file_chunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Project_file_chunk.
     * @param {project_file_chunkUpsertArgs} args - Arguments to update or create a Project_file_chunk.
     * @example
     * // Update or create a Project_file_chunk
     * const project_file_chunk = await prisma.project_file_chunk.upsert({
     *   create: {
     *     // ... data to create a Project_file_chunk
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project_file_chunk we want to update
     *   }
     * })
     */
    upsert<T extends project_file_chunkUpsertArgs>(args: SelectSubset<T, project_file_chunkUpsertArgs<ExtArgs>>): Prisma__project_file_chunkClient<$Result.GetResult<Prisma.$project_file_chunkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Project_file_chunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkCountArgs} args - Arguments to filter Project_file_chunks to count.
     * @example
     * // Count the number of Project_file_chunks
     * const count = await prisma.project_file_chunk.count({
     *   where: {
     *     // ... the filter for the Project_file_chunks we want to count
     *   }
     * })
    **/
    count<T extends project_file_chunkCountArgs>(
      args?: Subset<T, project_file_chunkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Project_file_chunkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project_file_chunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Project_file_chunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Project_file_chunkAggregateArgs>(args: Subset<T, Project_file_chunkAggregateArgs>): Prisma.PrismaPromise<GetProject_file_chunkAggregateType<T>>

    /**
     * Group by Project_file_chunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {project_file_chunkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends project_file_chunkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: project_file_chunkGroupByArgs['orderBy'] }
        : { orderBy?: project_file_chunkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, project_file_chunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProject_file_chunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the project_file_chunk model
   */
  readonly fields: project_file_chunkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for project_file_chunk.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__project_file_chunkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project_file<T extends project_fileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, project_fileDefaultArgs<ExtArgs>>): Prisma__project_fileClient<$Result.GetResult<Prisma.$project_filePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the project_file_chunk model
   */
  interface project_file_chunkFieldRefs {
    readonly id: FieldRef<"project_file_chunk", 'Int'>
    readonly project_file_id: FieldRef<"project_file_chunk", 'Int'>
    readonly vector_id: FieldRef<"project_file_chunk", 'String'>
  }
    

  // Custom InputTypes
  /**
   * project_file_chunk findUnique
   */
  export type project_file_chunkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter, which project_file_chunk to fetch.
     */
    where: project_file_chunkWhereUniqueInput
  }

  /**
   * project_file_chunk findUniqueOrThrow
   */
  export type project_file_chunkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter, which project_file_chunk to fetch.
     */
    where: project_file_chunkWhereUniqueInput
  }

  /**
   * project_file_chunk findFirst
   */
  export type project_file_chunkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter, which project_file_chunk to fetch.
     */
    where?: project_file_chunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_file_chunks to fetch.
     */
    orderBy?: project_file_chunkOrderByWithRelationInput | project_file_chunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for project_file_chunks.
     */
    cursor?: project_file_chunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_file_chunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_file_chunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of project_file_chunks.
     */
    distinct?: Project_file_chunkScalarFieldEnum | Project_file_chunkScalarFieldEnum[]
  }

  /**
   * project_file_chunk findFirstOrThrow
   */
  export type project_file_chunkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter, which project_file_chunk to fetch.
     */
    where?: project_file_chunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_file_chunks to fetch.
     */
    orderBy?: project_file_chunkOrderByWithRelationInput | project_file_chunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for project_file_chunks.
     */
    cursor?: project_file_chunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_file_chunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_file_chunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of project_file_chunks.
     */
    distinct?: Project_file_chunkScalarFieldEnum | Project_file_chunkScalarFieldEnum[]
  }

  /**
   * project_file_chunk findMany
   */
  export type project_file_chunkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter, which project_file_chunks to fetch.
     */
    where?: project_file_chunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of project_file_chunks to fetch.
     */
    orderBy?: project_file_chunkOrderByWithRelationInput | project_file_chunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing project_file_chunks.
     */
    cursor?: project_file_chunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` project_file_chunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` project_file_chunks.
     */
    skip?: number
    distinct?: Project_file_chunkScalarFieldEnum | Project_file_chunkScalarFieldEnum[]
  }

  /**
   * project_file_chunk create
   */
  export type project_file_chunkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * The data needed to create a project_file_chunk.
     */
    data: XOR<project_file_chunkCreateInput, project_file_chunkUncheckedCreateInput>
  }

  /**
   * project_file_chunk createMany
   */
  export type project_file_chunkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many project_file_chunks.
     */
    data: project_file_chunkCreateManyInput | project_file_chunkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * project_file_chunk update
   */
  export type project_file_chunkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * The data needed to update a project_file_chunk.
     */
    data: XOR<project_file_chunkUpdateInput, project_file_chunkUncheckedUpdateInput>
    /**
     * Choose, which project_file_chunk to update.
     */
    where: project_file_chunkWhereUniqueInput
  }

  /**
   * project_file_chunk updateMany
   */
  export type project_file_chunkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update project_file_chunks.
     */
    data: XOR<project_file_chunkUpdateManyMutationInput, project_file_chunkUncheckedUpdateManyInput>
    /**
     * Filter which project_file_chunks to update
     */
    where?: project_file_chunkWhereInput
    /**
     * Limit how many project_file_chunks to update.
     */
    limit?: number
  }

  /**
   * project_file_chunk upsert
   */
  export type project_file_chunkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * The filter to search for the project_file_chunk to update in case it exists.
     */
    where: project_file_chunkWhereUniqueInput
    /**
     * In case the project_file_chunk found by the `where` argument doesn't exist, create a new project_file_chunk with this data.
     */
    create: XOR<project_file_chunkCreateInput, project_file_chunkUncheckedCreateInput>
    /**
     * In case the project_file_chunk was found with the provided `where` argument, update it with this data.
     */
    update: XOR<project_file_chunkUpdateInput, project_file_chunkUncheckedUpdateInput>
  }

  /**
   * project_file_chunk delete
   */
  export type project_file_chunkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
    /**
     * Filter which project_file_chunk to delete.
     */
    where: project_file_chunkWhereUniqueInput
  }

  /**
   * project_file_chunk deleteMany
   */
  export type project_file_chunkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which project_file_chunks to delete
     */
    where?: project_file_chunkWhereInput
    /**
     * Limit how many project_file_chunks to delete.
     */
    limit?: number
  }

  /**
   * project_file_chunk without action
   */
  export type project_file_chunkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the project_file_chunk
     */
    select?: project_file_chunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the project_file_chunk
     */
    omit?: project_file_chunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: project_file_chunkInclude<ExtArgs> | null
  }


  /**
   * Model ai_conversation
   */

  export type AggregateAi_conversation = {
    _count: Ai_conversationCountAggregateOutputType | null
    _avg: Ai_conversationAvgAggregateOutputType | null
    _sum: Ai_conversationSumAggregateOutputType | null
    _min: Ai_conversationMinAggregateOutputType | null
    _max: Ai_conversationMaxAggregateOutputType | null
  }

  export type Ai_conversationAvgAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type Ai_conversationSumAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type Ai_conversationMinAggregateOutputType = {
    id: number | null
    keyname: string | null
    label: string | null
    user_id: number | null
    create_at: Date | null
    update_at: Date | null
  }

  export type Ai_conversationMaxAggregateOutputType = {
    id: number | null
    keyname: string | null
    label: string | null
    user_id: number | null
    create_at: Date | null
    update_at: Date | null
  }

  export type Ai_conversationCountAggregateOutputType = {
    id: number
    keyname: number
    label: number
    content: number
    history: number
    user_id: number
    create_at: number
    update_at: number
    _all: number
  }


  export type Ai_conversationAvgAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type Ai_conversationSumAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type Ai_conversationMinAggregateInputType = {
    id?: true
    keyname?: true
    label?: true
    user_id?: true
    create_at?: true
    update_at?: true
  }

  export type Ai_conversationMaxAggregateInputType = {
    id?: true
    keyname?: true
    label?: true
    user_id?: true
    create_at?: true
    update_at?: true
  }

  export type Ai_conversationCountAggregateInputType = {
    id?: true
    keyname?: true
    label?: true
    content?: true
    history?: true
    user_id?: true
    create_at?: true
    update_at?: true
    _all?: true
  }

  export type Ai_conversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ai_conversation to aggregate.
     */
    where?: ai_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ai_conversations to fetch.
     */
    orderBy?: ai_conversationOrderByWithRelationInput | ai_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ai_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ai_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ai_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ai_conversations
    **/
    _count?: true | Ai_conversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ai_conversationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ai_conversationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ai_conversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ai_conversationMaxAggregateInputType
  }

  export type GetAi_conversationAggregateType<T extends Ai_conversationAggregateArgs> = {
        [P in keyof T & keyof AggregateAi_conversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAi_conversation[P]>
      : GetScalarType<T[P], AggregateAi_conversation[P]>
  }




  export type ai_conversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ai_conversationWhereInput
    orderBy?: ai_conversationOrderByWithAggregationInput | ai_conversationOrderByWithAggregationInput[]
    by: Ai_conversationScalarFieldEnum[] | Ai_conversationScalarFieldEnum
    having?: ai_conversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ai_conversationCountAggregateInputType | true
    _avg?: Ai_conversationAvgAggregateInputType
    _sum?: Ai_conversationSumAggregateInputType
    _min?: Ai_conversationMinAggregateInputType
    _max?: Ai_conversationMaxAggregateInputType
  }

  export type Ai_conversationGroupByOutputType = {
    id: number
    keyname: string
    label: string
    content: JsonValue | null
    history: JsonValue | null
    user_id: number
    create_at: Date | null
    update_at: Date | null
    _count: Ai_conversationCountAggregateOutputType | null
    _avg: Ai_conversationAvgAggregateOutputType | null
    _sum: Ai_conversationSumAggregateOutputType | null
    _min: Ai_conversationMinAggregateOutputType | null
    _max: Ai_conversationMaxAggregateOutputType | null
  }

  type GetAi_conversationGroupByPayload<T extends ai_conversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ai_conversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ai_conversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ai_conversationGroupByOutputType[P]>
            : GetScalarType<T[P], Ai_conversationGroupByOutputType[P]>
        }
      >
    >


  export type ai_conversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyname?: boolean
    label?: boolean
    content?: boolean
    history?: boolean
    user_id?: boolean
    create_at?: boolean
    update_at?: boolean
    user?: boolean | userDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ai_conversation"]>



  export type ai_conversationSelectScalar = {
    id?: boolean
    keyname?: boolean
    label?: boolean
    content?: boolean
    history?: boolean
    user_id?: boolean
    create_at?: boolean
    update_at?: boolean
  }

  export type ai_conversationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "keyname" | "label" | "content" | "history" | "user_id" | "create_at" | "update_at", ExtArgs["result"]["ai_conversation"]>
  export type ai_conversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | userDefaultArgs<ExtArgs>
  }

  export type $ai_conversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ai_conversation"
    objects: {
      user: Prisma.$userPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      keyname: string
      label: string
      content: Prisma.JsonValue | null
      history: Prisma.JsonValue | null
      user_id: number
      create_at: Date | null
      update_at: Date | null
    }, ExtArgs["result"]["ai_conversation"]>
    composites: {}
  }

  type ai_conversationGetPayload<S extends boolean | null | undefined | ai_conversationDefaultArgs> = $Result.GetResult<Prisma.$ai_conversationPayload, S>

  type ai_conversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ai_conversationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ai_conversationCountAggregateInputType | true
    }

  export interface ai_conversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ai_conversation'], meta: { name: 'ai_conversation' } }
    /**
     * Find zero or one Ai_conversation that matches the filter.
     * @param {ai_conversationFindUniqueArgs} args - Arguments to find a Ai_conversation
     * @example
     * // Get one Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ai_conversationFindUniqueArgs>(args: SelectSubset<T, ai_conversationFindUniqueArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ai_conversation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ai_conversationFindUniqueOrThrowArgs} args - Arguments to find a Ai_conversation
     * @example
     * // Get one Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ai_conversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ai_conversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ai_conversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationFindFirstArgs} args - Arguments to find a Ai_conversation
     * @example
     * // Get one Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ai_conversationFindFirstArgs>(args?: SelectSubset<T, ai_conversationFindFirstArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ai_conversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationFindFirstOrThrowArgs} args - Arguments to find a Ai_conversation
     * @example
     * // Get one Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ai_conversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ai_conversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ai_conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ai_conversations
     * const ai_conversations = await prisma.ai_conversation.findMany()
     * 
     * // Get first 10 Ai_conversations
     * const ai_conversations = await prisma.ai_conversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ai_conversationWithIdOnly = await prisma.ai_conversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ai_conversationFindManyArgs>(args?: SelectSubset<T, ai_conversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ai_conversation.
     * @param {ai_conversationCreateArgs} args - Arguments to create a Ai_conversation.
     * @example
     * // Create one Ai_conversation
     * const Ai_conversation = await prisma.ai_conversation.create({
     *   data: {
     *     // ... data to create a Ai_conversation
     *   }
     * })
     * 
     */
    create<T extends ai_conversationCreateArgs>(args: SelectSubset<T, ai_conversationCreateArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ai_conversations.
     * @param {ai_conversationCreateManyArgs} args - Arguments to create many Ai_conversations.
     * @example
     * // Create many Ai_conversations
     * const ai_conversation = await prisma.ai_conversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ai_conversationCreateManyArgs>(args?: SelectSubset<T, ai_conversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ai_conversation.
     * @param {ai_conversationDeleteArgs} args - Arguments to delete one Ai_conversation.
     * @example
     * // Delete one Ai_conversation
     * const Ai_conversation = await prisma.ai_conversation.delete({
     *   where: {
     *     // ... filter to delete one Ai_conversation
     *   }
     * })
     * 
     */
    delete<T extends ai_conversationDeleteArgs>(args: SelectSubset<T, ai_conversationDeleteArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ai_conversation.
     * @param {ai_conversationUpdateArgs} args - Arguments to update one Ai_conversation.
     * @example
     * // Update one Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ai_conversationUpdateArgs>(args: SelectSubset<T, ai_conversationUpdateArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ai_conversations.
     * @param {ai_conversationDeleteManyArgs} args - Arguments to filter Ai_conversations to delete.
     * @example
     * // Delete a few Ai_conversations
     * const { count } = await prisma.ai_conversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ai_conversationDeleteManyArgs>(args?: SelectSubset<T, ai_conversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ai_conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ai_conversations
     * const ai_conversation = await prisma.ai_conversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ai_conversationUpdateManyArgs>(args: SelectSubset<T, ai_conversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ai_conversation.
     * @param {ai_conversationUpsertArgs} args - Arguments to update or create a Ai_conversation.
     * @example
     * // Update or create a Ai_conversation
     * const ai_conversation = await prisma.ai_conversation.upsert({
     *   create: {
     *     // ... data to create a Ai_conversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ai_conversation we want to update
     *   }
     * })
     */
    upsert<T extends ai_conversationUpsertArgs>(args: SelectSubset<T, ai_conversationUpsertArgs<ExtArgs>>): Prisma__ai_conversationClient<$Result.GetResult<Prisma.$ai_conversationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ai_conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationCountArgs} args - Arguments to filter Ai_conversations to count.
     * @example
     * // Count the number of Ai_conversations
     * const count = await prisma.ai_conversation.count({
     *   where: {
     *     // ... the filter for the Ai_conversations we want to count
     *   }
     * })
    **/
    count<T extends ai_conversationCountArgs>(
      args?: Subset<T, ai_conversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ai_conversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ai_conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ai_conversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Ai_conversationAggregateArgs>(args: Subset<T, Ai_conversationAggregateArgs>): Prisma.PrismaPromise<GetAi_conversationAggregateType<T>>

    /**
     * Group by Ai_conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ai_conversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ai_conversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ai_conversationGroupByArgs['orderBy'] }
        : { orderBy?: ai_conversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ai_conversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAi_conversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ai_conversation model
   */
  readonly fields: ai_conversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ai_conversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ai_conversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends userDefaultArgs<ExtArgs> = {}>(args?: Subset<T, userDefaultArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ai_conversation model
   */
  interface ai_conversationFieldRefs {
    readonly id: FieldRef<"ai_conversation", 'Int'>
    readonly keyname: FieldRef<"ai_conversation", 'String'>
    readonly label: FieldRef<"ai_conversation", 'String'>
    readonly content: FieldRef<"ai_conversation", 'Json'>
    readonly history: FieldRef<"ai_conversation", 'Json'>
    readonly user_id: FieldRef<"ai_conversation", 'Int'>
    readonly create_at: FieldRef<"ai_conversation", 'DateTime'>
    readonly update_at: FieldRef<"ai_conversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ai_conversation findUnique
   */
  export type ai_conversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter, which ai_conversation to fetch.
     */
    where: ai_conversationWhereUniqueInput
  }

  /**
   * ai_conversation findUniqueOrThrow
   */
  export type ai_conversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter, which ai_conversation to fetch.
     */
    where: ai_conversationWhereUniqueInput
  }

  /**
   * ai_conversation findFirst
   */
  export type ai_conversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter, which ai_conversation to fetch.
     */
    where?: ai_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ai_conversations to fetch.
     */
    orderBy?: ai_conversationOrderByWithRelationInput | ai_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ai_conversations.
     */
    cursor?: ai_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ai_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ai_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ai_conversations.
     */
    distinct?: Ai_conversationScalarFieldEnum | Ai_conversationScalarFieldEnum[]
  }

  /**
   * ai_conversation findFirstOrThrow
   */
  export type ai_conversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter, which ai_conversation to fetch.
     */
    where?: ai_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ai_conversations to fetch.
     */
    orderBy?: ai_conversationOrderByWithRelationInput | ai_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ai_conversations.
     */
    cursor?: ai_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ai_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ai_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ai_conversations.
     */
    distinct?: Ai_conversationScalarFieldEnum | Ai_conversationScalarFieldEnum[]
  }

  /**
   * ai_conversation findMany
   */
  export type ai_conversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter, which ai_conversations to fetch.
     */
    where?: ai_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ai_conversations to fetch.
     */
    orderBy?: ai_conversationOrderByWithRelationInput | ai_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ai_conversations.
     */
    cursor?: ai_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ai_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ai_conversations.
     */
    skip?: number
    distinct?: Ai_conversationScalarFieldEnum | Ai_conversationScalarFieldEnum[]
  }

  /**
   * ai_conversation create
   */
  export type ai_conversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * The data needed to create a ai_conversation.
     */
    data: XOR<ai_conversationCreateInput, ai_conversationUncheckedCreateInput>
  }

  /**
   * ai_conversation createMany
   */
  export type ai_conversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ai_conversations.
     */
    data: ai_conversationCreateManyInput | ai_conversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ai_conversation update
   */
  export type ai_conversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * The data needed to update a ai_conversation.
     */
    data: XOR<ai_conversationUpdateInput, ai_conversationUncheckedUpdateInput>
    /**
     * Choose, which ai_conversation to update.
     */
    where: ai_conversationWhereUniqueInput
  }

  /**
   * ai_conversation updateMany
   */
  export type ai_conversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ai_conversations.
     */
    data: XOR<ai_conversationUpdateManyMutationInput, ai_conversationUncheckedUpdateManyInput>
    /**
     * Filter which ai_conversations to update
     */
    where?: ai_conversationWhereInput
    /**
     * Limit how many ai_conversations to update.
     */
    limit?: number
  }

  /**
   * ai_conversation upsert
   */
  export type ai_conversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * The filter to search for the ai_conversation to update in case it exists.
     */
    where: ai_conversationWhereUniqueInput
    /**
     * In case the ai_conversation found by the `where` argument doesn't exist, create a new ai_conversation with this data.
     */
    create: XOR<ai_conversationCreateInput, ai_conversationUncheckedCreateInput>
    /**
     * In case the ai_conversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ai_conversationUpdateInput, ai_conversationUncheckedUpdateInput>
  }

  /**
   * ai_conversation delete
   */
  export type ai_conversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
    /**
     * Filter which ai_conversation to delete.
     */
    where: ai_conversationWhereUniqueInput
  }

  /**
   * ai_conversation deleteMany
   */
  export type ai_conversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ai_conversations to delete
     */
    where?: ai_conversationWhereInput
    /**
     * Limit how many ai_conversations to delete.
     */
    limit?: number
  }

  /**
   * ai_conversation without action
   */
  export type ai_conversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ai_conversation
     */
    select?: ai_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ai_conversation
     */
    omit?: ai_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ai_conversationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password: 'password',
    create_at: 'create_at',
    update_at: 'update_at',
    email: 'email'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const User_articleScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    article_id: 'article_id'
  };

  export type User_articleScalarFieldEnum = (typeof User_articleScalarFieldEnum)[keyof typeof User_articleScalarFieldEnum]


  export const ArticleScalarFieldEnum: {
    id: 'id',
    link: 'link',
    create_at: 'create_at',
    update_at: 'update_at',
    title: 'title',
    quiz_type: 'quiz_type',
    content: 'content',
    content_mindmap: 'content_mindmap',
    user_note: 'user_note',
    gist: 'gist',
    content_type: 'content_type',
    job_type: 'job_type',
    hard: 'hard',
    anki_note_id: 'anki_note_id',
    time_create: 'time_create',
    time_update: 'time_update'
  };

  export type ArticleScalarFieldEnum = (typeof ArticleScalarFieldEnum)[keyof typeof ArticleScalarFieldEnum]


  export const User_projectScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    project_name: 'project_name'
  };

  export type User_projectScalarFieldEnum = (typeof User_projectScalarFieldEnum)[keyof typeof User_projectScalarFieldEnum]


  export const Project_fileScalarFieldEnum: {
    id: 'id',
    file_path: 'file_path',
    hash: 'hash',
    user_project_id: 'user_project_id'
  };

  export type Project_fileScalarFieldEnum = (typeof Project_fileScalarFieldEnum)[keyof typeof Project_fileScalarFieldEnum]


  export const Project_file_chunkScalarFieldEnum: {
    id: 'id',
    project_file_id: 'project_file_id',
    vector_id: 'vector_id'
  };

  export type Project_file_chunkScalarFieldEnum = (typeof Project_file_chunkScalarFieldEnum)[keyof typeof Project_file_chunkScalarFieldEnum]


  export const Ai_conversationScalarFieldEnum: {
    id: 'id',
    keyname: 'keyname',
    label: 'label',
    content: 'content',
    history: 'history',
    user_id: 'user_id',
    create_at: 'create_at',
    update_at: 'update_at'
  };

  export type Ai_conversationScalarFieldEnum = (typeof Ai_conversationScalarFieldEnum)[keyof typeof Ai_conversationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const userOrderByRelevanceFieldEnum: {
    username: 'username',
    password: 'password',
    email: 'email'
  };

  export type userOrderByRelevanceFieldEnum = (typeof userOrderByRelevanceFieldEnum)[keyof typeof userOrderByRelevanceFieldEnum]


  export const articleOrderByRelevanceFieldEnum: {
    link: 'link',
    title: 'title',
    quiz_type: 'quiz_type',
    content: 'content',
    content_mindmap: 'content_mindmap',
    user_note: 'user_note',
    gist: 'gist',
    content_type: 'content_type',
    job_type: 'job_type',
    hard: 'hard'
  };

  export type articleOrderByRelevanceFieldEnum = (typeof articleOrderByRelevanceFieldEnum)[keyof typeof articleOrderByRelevanceFieldEnum]


  export const user_projectOrderByRelevanceFieldEnum: {
    project_name: 'project_name'
  };

  export type user_projectOrderByRelevanceFieldEnum = (typeof user_projectOrderByRelevanceFieldEnum)[keyof typeof user_projectOrderByRelevanceFieldEnum]


  export const project_fileOrderByRelevanceFieldEnum: {
    file_path: 'file_path',
    hash: 'hash'
  };

  export type project_fileOrderByRelevanceFieldEnum = (typeof project_fileOrderByRelevanceFieldEnum)[keyof typeof project_fileOrderByRelevanceFieldEnum]


  export const project_file_chunkOrderByRelevanceFieldEnum: {
    vector_id: 'vector_id'
  };

  export type project_file_chunkOrderByRelevanceFieldEnum = (typeof project_file_chunkOrderByRelevanceFieldEnum)[keyof typeof project_file_chunkOrderByRelevanceFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const ai_conversationOrderByRelevanceFieldEnum: {
    keyname: 'keyname',
    label: 'label'
  };

  export type ai_conversationOrderByRelevanceFieldEnum = (typeof ai_conversationOrderByRelevanceFieldEnum)[keyof typeof ai_conversationOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type userWhereInput = {
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    id?: IntFilter<"user"> | number
    username?: StringFilter<"user"> | string
    password?: StringFilter<"user"> | string
    create_at?: DateTimeNullableFilter<"user"> | Date | string | null
    update_at?: DateTimeNullableFilter<"user"> | Date | string | null
    email?: StringFilter<"user"> | string
    user_articles?: User_articleListRelationFilter
    ai_conversation?: Ai_conversationListRelationFilter
    user_project?: User_projectListRelationFilter
  }

  export type userOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    email?: SortOrder
    user_articles?: user_articleOrderByRelationAggregateInput
    ai_conversation?: ai_conversationOrderByRelationAggregateInput
    user_project?: user_projectOrderByRelationAggregateInput
    _relevance?: userOrderByRelevanceInput
  }

  export type userWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    password?: StringFilter<"user"> | string
    create_at?: DateTimeNullableFilter<"user"> | Date | string | null
    update_at?: DateTimeNullableFilter<"user"> | Date | string | null
    email?: StringFilter<"user"> | string
    user_articles?: User_articleListRelationFilter
    ai_conversation?: Ai_conversationListRelationFilter
    user_project?: User_projectListRelationFilter
  }, "id" | "username">

  export type userOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    email?: SortOrder
    _count?: userCountOrderByAggregateInput
    _avg?: userAvgOrderByAggregateInput
    _max?: userMaxOrderByAggregateInput
    _min?: userMinOrderByAggregateInput
    _sum?: userSumOrderByAggregateInput
  }

  export type userScalarWhereWithAggregatesInput = {
    AND?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    OR?: userScalarWhereWithAggregatesInput[]
    NOT?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"user"> | number
    username?: StringWithAggregatesFilter<"user"> | string
    password?: StringWithAggregatesFilter<"user"> | string
    create_at?: DateTimeNullableWithAggregatesFilter<"user"> | Date | string | null
    update_at?: DateTimeNullableWithAggregatesFilter<"user"> | Date | string | null
    email?: StringWithAggregatesFilter<"user"> | string
  }

  export type user_articleWhereInput = {
    AND?: user_articleWhereInput | user_articleWhereInput[]
    OR?: user_articleWhereInput[]
    NOT?: user_articleWhereInput | user_articleWhereInput[]
    id?: IntFilter<"user_article"> | number
    user_id?: IntFilter<"user_article"> | number
    article_id?: IntFilter<"user_article"> | number
    user?: XOR<UserScalarRelationFilter, userWhereInput>
    article?: XOR<ArticleScalarRelationFilter, articleWhereInput>
  }

  export type user_articleOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
    user?: userOrderByWithRelationInput
    article?: articleOrderByWithRelationInput
  }

  export type user_articleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    user_id_article_id?: user_articleUser_idArticle_idCompoundUniqueInput
    AND?: user_articleWhereInput | user_articleWhereInput[]
    OR?: user_articleWhereInput[]
    NOT?: user_articleWhereInput | user_articleWhereInput[]
    user_id?: IntFilter<"user_article"> | number
    article_id?: IntFilter<"user_article"> | number
    user?: XOR<UserScalarRelationFilter, userWhereInput>
    article?: XOR<ArticleScalarRelationFilter, articleWhereInput>
  }, "id" | "user_id_article_id">

  export type user_articleOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
    _count?: user_articleCountOrderByAggregateInput
    _avg?: user_articleAvgOrderByAggregateInput
    _max?: user_articleMaxOrderByAggregateInput
    _min?: user_articleMinOrderByAggregateInput
    _sum?: user_articleSumOrderByAggregateInput
  }

  export type user_articleScalarWhereWithAggregatesInput = {
    AND?: user_articleScalarWhereWithAggregatesInput | user_articleScalarWhereWithAggregatesInput[]
    OR?: user_articleScalarWhereWithAggregatesInput[]
    NOT?: user_articleScalarWhereWithAggregatesInput | user_articleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"user_article"> | number
    user_id?: IntWithAggregatesFilter<"user_article"> | number
    article_id?: IntWithAggregatesFilter<"user_article"> | number
  }

  export type articleWhereInput = {
    AND?: articleWhereInput | articleWhereInput[]
    OR?: articleWhereInput[]
    NOT?: articleWhereInput | articleWhereInput[]
    id?: IntFilter<"article"> | number
    link?: StringFilter<"article"> | string
    create_at?: DateTimeNullableFilter<"article"> | Date | string | null
    update_at?: DateTimeNullableFilter<"article"> | Date | string | null
    title?: StringFilter<"article"> | string
    quiz_type?: StringFilter<"article"> | string
    content?: StringFilter<"article"> | string
    content_mindmap?: StringNullableFilter<"article"> | string | null
    user_note?: StringNullableFilter<"article"> | string | null
    gist?: StringFilter<"article"> | string
    content_type?: StringFilter<"article"> | string
    job_type?: StringNullableFilter<"article"> | string | null
    hard?: StringFilter<"article"> | string
    anki_note_id?: BigIntNullableFilter<"article"> | bigint | number | null
    time_create?: DateTimeNullableFilter<"article"> | Date | string | null
    time_update?: DateTimeNullableFilter<"article"> | Date | string | null
    user_articles?: User_articleListRelationFilter
  }

  export type articleOrderByWithRelationInput = {
    id?: SortOrder
    link?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    title?: SortOrder
    quiz_type?: SortOrder
    content?: SortOrder
    content_mindmap?: SortOrderInput | SortOrder
    user_note?: SortOrderInput | SortOrder
    gist?: SortOrder
    content_type?: SortOrder
    job_type?: SortOrderInput | SortOrder
    hard?: SortOrder
    anki_note_id?: SortOrderInput | SortOrder
    time_create?: SortOrderInput | SortOrder
    time_update?: SortOrderInput | SortOrder
    user_articles?: user_articleOrderByRelationAggregateInput
    _relevance?: articleOrderByRelevanceInput
  }

  export type articleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    link?: string
    AND?: articleWhereInput | articleWhereInput[]
    OR?: articleWhereInput[]
    NOT?: articleWhereInput | articleWhereInput[]
    create_at?: DateTimeNullableFilter<"article"> | Date | string | null
    update_at?: DateTimeNullableFilter<"article"> | Date | string | null
    title?: StringFilter<"article"> | string
    quiz_type?: StringFilter<"article"> | string
    content?: StringFilter<"article"> | string
    content_mindmap?: StringNullableFilter<"article"> | string | null
    user_note?: StringNullableFilter<"article"> | string | null
    gist?: StringFilter<"article"> | string
    content_type?: StringFilter<"article"> | string
    job_type?: StringNullableFilter<"article"> | string | null
    hard?: StringFilter<"article"> | string
    anki_note_id?: BigIntNullableFilter<"article"> | bigint | number | null
    time_create?: DateTimeNullableFilter<"article"> | Date | string | null
    time_update?: DateTimeNullableFilter<"article"> | Date | string | null
    user_articles?: User_articleListRelationFilter
  }, "id" | "link">

  export type articleOrderByWithAggregationInput = {
    id?: SortOrder
    link?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    title?: SortOrder
    quiz_type?: SortOrder
    content?: SortOrder
    content_mindmap?: SortOrderInput | SortOrder
    user_note?: SortOrderInput | SortOrder
    gist?: SortOrder
    content_type?: SortOrder
    job_type?: SortOrderInput | SortOrder
    hard?: SortOrder
    anki_note_id?: SortOrderInput | SortOrder
    time_create?: SortOrderInput | SortOrder
    time_update?: SortOrderInput | SortOrder
    _count?: articleCountOrderByAggregateInput
    _avg?: articleAvgOrderByAggregateInput
    _max?: articleMaxOrderByAggregateInput
    _min?: articleMinOrderByAggregateInput
    _sum?: articleSumOrderByAggregateInput
  }

  export type articleScalarWhereWithAggregatesInput = {
    AND?: articleScalarWhereWithAggregatesInput | articleScalarWhereWithAggregatesInput[]
    OR?: articleScalarWhereWithAggregatesInput[]
    NOT?: articleScalarWhereWithAggregatesInput | articleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"article"> | number
    link?: StringWithAggregatesFilter<"article"> | string
    create_at?: DateTimeNullableWithAggregatesFilter<"article"> | Date | string | null
    update_at?: DateTimeNullableWithAggregatesFilter<"article"> | Date | string | null
    title?: StringWithAggregatesFilter<"article"> | string
    quiz_type?: StringWithAggregatesFilter<"article"> | string
    content?: StringWithAggregatesFilter<"article"> | string
    content_mindmap?: StringNullableWithAggregatesFilter<"article"> | string | null
    user_note?: StringNullableWithAggregatesFilter<"article"> | string | null
    gist?: StringWithAggregatesFilter<"article"> | string
    content_type?: StringWithAggregatesFilter<"article"> | string
    job_type?: StringNullableWithAggregatesFilter<"article"> | string | null
    hard?: StringWithAggregatesFilter<"article"> | string
    anki_note_id?: BigIntNullableWithAggregatesFilter<"article"> | bigint | number | null
    time_create?: DateTimeNullableWithAggregatesFilter<"article"> | Date | string | null
    time_update?: DateTimeNullableWithAggregatesFilter<"article"> | Date | string | null
  }

  export type user_projectWhereInput = {
    AND?: user_projectWhereInput | user_projectWhereInput[]
    OR?: user_projectWhereInput[]
    NOT?: user_projectWhereInput | user_projectWhereInput[]
    id?: IntFilter<"user_project"> | number
    user_id?: IntFilter<"user_project"> | number
    project_name?: StringFilter<"user_project"> | string
    project_file?: Project_fileListRelationFilter
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }

  export type user_projectOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    project_name?: SortOrder
    project_file?: project_fileOrderByRelationAggregateInput
    user?: userOrderByWithRelationInput
    _relevance?: user_projectOrderByRelevanceInput
  }

  export type user_projectWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    user_id_project_name?: user_projectUser_idProject_nameCompoundUniqueInput
    AND?: user_projectWhereInput | user_projectWhereInput[]
    OR?: user_projectWhereInput[]
    NOT?: user_projectWhereInput | user_projectWhereInput[]
    user_id?: IntFilter<"user_project"> | number
    project_name?: StringFilter<"user_project"> | string
    project_file?: Project_fileListRelationFilter
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }, "id" | "user_id_project_name">

  export type user_projectOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    project_name?: SortOrder
    _count?: user_projectCountOrderByAggregateInput
    _avg?: user_projectAvgOrderByAggregateInput
    _max?: user_projectMaxOrderByAggregateInput
    _min?: user_projectMinOrderByAggregateInput
    _sum?: user_projectSumOrderByAggregateInput
  }

  export type user_projectScalarWhereWithAggregatesInput = {
    AND?: user_projectScalarWhereWithAggregatesInput | user_projectScalarWhereWithAggregatesInput[]
    OR?: user_projectScalarWhereWithAggregatesInput[]
    NOT?: user_projectScalarWhereWithAggregatesInput | user_projectScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"user_project"> | number
    user_id?: IntWithAggregatesFilter<"user_project"> | number
    project_name?: StringWithAggregatesFilter<"user_project"> | string
  }

  export type project_fileWhereInput = {
    AND?: project_fileWhereInput | project_fileWhereInput[]
    OR?: project_fileWhereInput[]
    NOT?: project_fileWhereInput | project_fileWhereInput[]
    id?: IntFilter<"project_file"> | number
    file_path?: StringFilter<"project_file"> | string
    hash?: StringFilter<"project_file"> | string
    user_project_id?: IntFilter<"project_file"> | number
    user_project?: XOR<User_projectScalarRelationFilter, user_projectWhereInput>
    chunks?: Project_file_chunkListRelationFilter
  }

  export type project_fileOrderByWithRelationInput = {
    id?: SortOrder
    file_path?: SortOrder
    hash?: SortOrder
    user_project_id?: SortOrder
    user_project?: user_projectOrderByWithRelationInput
    chunks?: project_file_chunkOrderByRelationAggregateInput
    _relevance?: project_fileOrderByRelevanceInput
  }

  export type project_fileWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    user_project_id_file_path?: project_fileUser_project_idFile_pathCompoundUniqueInput
    AND?: project_fileWhereInput | project_fileWhereInput[]
    OR?: project_fileWhereInput[]
    NOT?: project_fileWhereInput | project_fileWhereInput[]
    file_path?: StringFilter<"project_file"> | string
    hash?: StringFilter<"project_file"> | string
    user_project_id?: IntFilter<"project_file"> | number
    user_project?: XOR<User_projectScalarRelationFilter, user_projectWhereInput>
    chunks?: Project_file_chunkListRelationFilter
  }, "id" | "user_project_id_file_path">

  export type project_fileOrderByWithAggregationInput = {
    id?: SortOrder
    file_path?: SortOrder
    hash?: SortOrder
    user_project_id?: SortOrder
    _count?: project_fileCountOrderByAggregateInput
    _avg?: project_fileAvgOrderByAggregateInput
    _max?: project_fileMaxOrderByAggregateInput
    _min?: project_fileMinOrderByAggregateInput
    _sum?: project_fileSumOrderByAggregateInput
  }

  export type project_fileScalarWhereWithAggregatesInput = {
    AND?: project_fileScalarWhereWithAggregatesInput | project_fileScalarWhereWithAggregatesInput[]
    OR?: project_fileScalarWhereWithAggregatesInput[]
    NOT?: project_fileScalarWhereWithAggregatesInput | project_fileScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"project_file"> | number
    file_path?: StringWithAggregatesFilter<"project_file"> | string
    hash?: StringWithAggregatesFilter<"project_file"> | string
    user_project_id?: IntWithAggregatesFilter<"project_file"> | number
  }

  export type project_file_chunkWhereInput = {
    AND?: project_file_chunkWhereInput | project_file_chunkWhereInput[]
    OR?: project_file_chunkWhereInput[]
    NOT?: project_file_chunkWhereInput | project_file_chunkWhereInput[]
    id?: IntFilter<"project_file_chunk"> | number
    project_file_id?: IntFilter<"project_file_chunk"> | number
    vector_id?: StringFilter<"project_file_chunk"> | string
    project_file?: XOR<Project_fileScalarRelationFilter, project_fileWhereInput>
  }

  export type project_file_chunkOrderByWithRelationInput = {
    id?: SortOrder
    project_file_id?: SortOrder
    vector_id?: SortOrder
    project_file?: project_fileOrderByWithRelationInput
    _relevance?: project_file_chunkOrderByRelevanceInput
  }

  export type project_file_chunkWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    vector_id?: string
    AND?: project_file_chunkWhereInput | project_file_chunkWhereInput[]
    OR?: project_file_chunkWhereInput[]
    NOT?: project_file_chunkWhereInput | project_file_chunkWhereInput[]
    project_file_id?: IntFilter<"project_file_chunk"> | number
    project_file?: XOR<Project_fileScalarRelationFilter, project_fileWhereInput>
  }, "id" | "vector_id">

  export type project_file_chunkOrderByWithAggregationInput = {
    id?: SortOrder
    project_file_id?: SortOrder
    vector_id?: SortOrder
    _count?: project_file_chunkCountOrderByAggregateInput
    _avg?: project_file_chunkAvgOrderByAggregateInput
    _max?: project_file_chunkMaxOrderByAggregateInput
    _min?: project_file_chunkMinOrderByAggregateInput
    _sum?: project_file_chunkSumOrderByAggregateInput
  }

  export type project_file_chunkScalarWhereWithAggregatesInput = {
    AND?: project_file_chunkScalarWhereWithAggregatesInput | project_file_chunkScalarWhereWithAggregatesInput[]
    OR?: project_file_chunkScalarWhereWithAggregatesInput[]
    NOT?: project_file_chunkScalarWhereWithAggregatesInput | project_file_chunkScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"project_file_chunk"> | number
    project_file_id?: IntWithAggregatesFilter<"project_file_chunk"> | number
    vector_id?: StringWithAggregatesFilter<"project_file_chunk"> | string
  }

  export type ai_conversationWhereInput = {
    AND?: ai_conversationWhereInput | ai_conversationWhereInput[]
    OR?: ai_conversationWhereInput[]
    NOT?: ai_conversationWhereInput | ai_conversationWhereInput[]
    id?: IntFilter<"ai_conversation"> | number
    keyname?: StringFilter<"ai_conversation"> | string
    label?: StringFilter<"ai_conversation"> | string
    content?: JsonNullableFilter<"ai_conversation">
    history?: JsonNullableFilter<"ai_conversation">
    user_id?: IntFilter<"ai_conversation"> | number
    create_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
    update_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }

  export type ai_conversationOrderByWithRelationInput = {
    id?: SortOrder
    keyname?: SortOrder
    label?: SortOrder
    content?: SortOrderInput | SortOrder
    history?: SortOrderInput | SortOrder
    user_id?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    user?: userOrderByWithRelationInput
    _relevance?: ai_conversationOrderByRelevanceInput
  }

  export type ai_conversationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    keyname?: string
    AND?: ai_conversationWhereInput | ai_conversationWhereInput[]
    OR?: ai_conversationWhereInput[]
    NOT?: ai_conversationWhereInput | ai_conversationWhereInput[]
    label?: StringFilter<"ai_conversation"> | string
    content?: JsonNullableFilter<"ai_conversation">
    history?: JsonNullableFilter<"ai_conversation">
    user_id?: IntFilter<"ai_conversation"> | number
    create_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
    update_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }, "id" | "keyname">

  export type ai_conversationOrderByWithAggregationInput = {
    id?: SortOrder
    keyname?: SortOrder
    label?: SortOrder
    content?: SortOrderInput | SortOrder
    history?: SortOrderInput | SortOrder
    user_id?: SortOrder
    create_at?: SortOrderInput | SortOrder
    update_at?: SortOrderInput | SortOrder
    _count?: ai_conversationCountOrderByAggregateInput
    _avg?: ai_conversationAvgOrderByAggregateInput
    _max?: ai_conversationMaxOrderByAggregateInput
    _min?: ai_conversationMinOrderByAggregateInput
    _sum?: ai_conversationSumOrderByAggregateInput
  }

  export type ai_conversationScalarWhereWithAggregatesInput = {
    AND?: ai_conversationScalarWhereWithAggregatesInput | ai_conversationScalarWhereWithAggregatesInput[]
    OR?: ai_conversationScalarWhereWithAggregatesInput[]
    NOT?: ai_conversationScalarWhereWithAggregatesInput | ai_conversationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ai_conversation"> | number
    keyname?: StringWithAggregatesFilter<"ai_conversation"> | string
    label?: StringWithAggregatesFilter<"ai_conversation"> | string
    content?: JsonNullableWithAggregatesFilter<"ai_conversation">
    history?: JsonNullableWithAggregatesFilter<"ai_conversation">
    user_id?: IntWithAggregatesFilter<"ai_conversation"> | number
    create_at?: DateTimeNullableWithAggregatesFilter<"ai_conversation"> | Date | string | null
    update_at?: DateTimeNullableWithAggregatesFilter<"ai_conversation"> | Date | string | null
  }

  export type userCreateInput = {
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleCreateNestedManyWithoutUserInput
    ai_conversation?: ai_conversationCreateNestedManyWithoutUserInput
    user_project?: user_projectCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateInput = {
    id?: number
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleUncheckedCreateNestedManyWithoutUserInput
    ai_conversation?: ai_conversationUncheckedCreateNestedManyWithoutUserInput
    user_project?: user_projectUncheckedCreateNestedManyWithoutUserInput
  }

  export type userUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUpdateManyWithoutUserNestedInput
    ai_conversation?: ai_conversationUpdateManyWithoutUserNestedInput
    user_project?: user_projectUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUncheckedUpdateManyWithoutUserNestedInput
    ai_conversation?: ai_conversationUncheckedUpdateManyWithoutUserNestedInput
    user_project?: user_projectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type userCreateManyInput = {
    id?: number
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
  }

  export type userUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
  }

  export type userUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
  }

  export type user_articleCreateInput = {
    user: userCreateNestedOneWithoutUser_articlesInput
    article: articleCreateNestedOneWithoutUser_articlesInput
  }

  export type user_articleUncheckedCreateInput = {
    id?: number
    user_id: number
    article_id: number
  }

  export type user_articleUpdateInput = {
    user?: userUpdateOneRequiredWithoutUser_articlesNestedInput
    article?: articleUpdateOneRequiredWithoutUser_articlesNestedInput
  }

  export type user_articleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    article_id?: IntFieldUpdateOperationsInput | number
  }

  export type user_articleCreateManyInput = {
    id?: number
    user_id: number
    article_id: number
  }

  export type user_articleUpdateManyMutationInput = {

  }

  export type user_articleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    article_id?: IntFieldUpdateOperationsInput | number
  }

  export type articleCreateInput = {
    link: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    title: string
    quiz_type: string
    content: string
    content_mindmap?: string | null
    user_note?: string | null
    gist: string
    content_type: string
    job_type?: string | null
    hard: string
    anki_note_id?: bigint | number | null
    time_create?: Date | string | null
    time_update?: Date | string | null
    user_articles?: user_articleCreateNestedManyWithoutArticleInput
  }

  export type articleUncheckedCreateInput = {
    id?: number
    link: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    title: string
    quiz_type: string
    content: string
    content_mindmap?: string | null
    user_note?: string | null
    gist: string
    content_type: string
    job_type?: string | null
    hard: string
    anki_note_id?: bigint | number | null
    time_create?: Date | string | null
    time_update?: Date | string | null
    user_articles?: user_articleUncheckedCreateNestedManyWithoutArticleInput
  }

  export type articleUpdateInput = {
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_articles?: user_articleUpdateManyWithoutArticleNestedInput
  }

  export type articleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_articles?: user_articleUncheckedUpdateManyWithoutArticleNestedInput
  }

  export type articleCreateManyInput = {
    id?: number
    link: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    title: string
    quiz_type: string
    content: string
    content_mindmap?: string | null
    user_note?: string | null
    gist: string
    content_type: string
    job_type?: string | null
    hard: string
    anki_note_id?: bigint | number | null
    time_create?: Date | string | null
    time_update?: Date | string | null
  }

  export type articleUpdateManyMutationInput = {
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type articleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type user_projectCreateInput = {
    project_name: string
    project_file?: project_fileCreateNestedManyWithoutUser_projectInput
    user: userCreateNestedOneWithoutUser_projectInput
  }

  export type user_projectUncheckedCreateInput = {
    id?: number
    user_id: number
    project_name: string
    project_file?: project_fileUncheckedCreateNestedManyWithoutUser_projectInput
  }

  export type user_projectUpdateInput = {
    project_name?: StringFieldUpdateOperationsInput | string
    project_file?: project_fileUpdateManyWithoutUser_projectNestedInput
    user?: userUpdateOneRequiredWithoutUser_projectNestedInput
  }

  export type user_projectUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    project_name?: StringFieldUpdateOperationsInput | string
    project_file?: project_fileUncheckedUpdateManyWithoutUser_projectNestedInput
  }

  export type user_projectCreateManyInput = {
    id?: number
    user_id: number
    project_name: string
  }

  export type user_projectUpdateManyMutationInput = {
    project_name?: StringFieldUpdateOperationsInput | string
  }

  export type user_projectUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    project_name?: StringFieldUpdateOperationsInput | string
  }

  export type project_fileCreateInput = {
    file_path: string
    hash: string
    user_project: user_projectCreateNestedOneWithoutProject_fileInput
    chunks?: project_file_chunkCreateNestedManyWithoutProject_fileInput
  }

  export type project_fileUncheckedCreateInput = {
    id?: number
    file_path: string
    hash: string
    user_project_id: number
    chunks?: project_file_chunkUncheckedCreateNestedManyWithoutProject_fileInput
  }

  export type project_fileUpdateInput = {
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    user_project?: user_projectUpdateOneRequiredWithoutProject_fileNestedInput
    chunks?: project_file_chunkUpdateManyWithoutProject_fileNestedInput
  }

  export type project_fileUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    user_project_id?: IntFieldUpdateOperationsInput | number
    chunks?: project_file_chunkUncheckedUpdateManyWithoutProject_fileNestedInput
  }

  export type project_fileCreateManyInput = {
    id?: number
    file_path: string
    hash: string
    user_project_id: number
  }

  export type project_fileUpdateManyMutationInput = {
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
  }

  export type project_fileUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    user_project_id?: IntFieldUpdateOperationsInput | number
  }

  export type project_file_chunkCreateInput = {
    vector_id: string
    project_file: project_fileCreateNestedOneWithoutChunksInput
  }

  export type project_file_chunkUncheckedCreateInput = {
    id?: number
    project_file_id: number
    vector_id: string
  }

  export type project_file_chunkUpdateInput = {
    vector_id?: StringFieldUpdateOperationsInput | string
    project_file?: project_fileUpdateOneRequiredWithoutChunksNestedInput
  }

  export type project_file_chunkUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    project_file_id?: IntFieldUpdateOperationsInput | number
    vector_id?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkCreateManyInput = {
    id?: number
    project_file_id: number
    vector_id: string
  }

  export type project_file_chunkUpdateManyMutationInput = {
    vector_id?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    project_file_id?: IntFieldUpdateOperationsInput | number
    vector_id?: StringFieldUpdateOperationsInput | string
  }

  export type ai_conversationCreateInput = {
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: Date | string | null
    update_at?: Date | string | null
    user: userCreateNestedOneWithoutAi_conversationInput
  }

  export type ai_conversationUncheckedCreateInput = {
    id?: number
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    user_id: number
    create_at?: Date | string | null
    update_at?: Date | string | null
  }

  export type ai_conversationUpdateInput = {
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: userUpdateOneRequiredWithoutAi_conversationNestedInput
  }

  export type ai_conversationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    user_id?: IntFieldUpdateOperationsInput | number
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ai_conversationCreateManyInput = {
    id?: number
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    user_id: number
    create_at?: Date | string | null
    update_at?: Date | string | null
  }

  export type ai_conversationUpdateManyMutationInput = {
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ai_conversationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    user_id?: IntFieldUpdateOperationsInput | number
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type User_articleListRelationFilter = {
    every?: user_articleWhereInput
    some?: user_articleWhereInput
    none?: user_articleWhereInput
  }

  export type Ai_conversationListRelationFilter = {
    every?: ai_conversationWhereInput
    some?: ai_conversationWhereInput
    none?: ai_conversationWhereInput
  }

  export type User_projectListRelationFilter = {
    every?: user_projectWhereInput
    some?: user_projectWhereInput
    none?: user_projectWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type user_articleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ai_conversationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type user_projectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type userOrderByRelevanceInput = {
    fields: userOrderByRelevanceFieldEnum | userOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type userCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    email?: SortOrder
  }

  export type userAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type userMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    email?: SortOrder
  }

  export type userMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    email?: SortOrder
  }

  export type userSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: userWhereInput
    isNot?: userWhereInput
  }

  export type ArticleScalarRelationFilter = {
    is?: articleWhereInput
    isNot?: articleWhereInput
  }

  export type user_articleUser_idArticle_idCompoundUniqueInput = {
    user_id: number
    article_id: number
  }

  export type user_articleCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
  }

  export type user_articleAvgOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
  }

  export type user_articleMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
  }

  export type user_articleMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
  }

  export type user_articleSumOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    article_id?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type articleOrderByRelevanceInput = {
    fields: articleOrderByRelevanceFieldEnum | articleOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type articleCountOrderByAggregateInput = {
    id?: SortOrder
    link?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    title?: SortOrder
    quiz_type?: SortOrder
    content?: SortOrder
    content_mindmap?: SortOrder
    user_note?: SortOrder
    gist?: SortOrder
    content_type?: SortOrder
    job_type?: SortOrder
    hard?: SortOrder
    anki_note_id?: SortOrder
    time_create?: SortOrder
    time_update?: SortOrder
  }

  export type articleAvgOrderByAggregateInput = {
    id?: SortOrder
    anki_note_id?: SortOrder
  }

  export type articleMaxOrderByAggregateInput = {
    id?: SortOrder
    link?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    title?: SortOrder
    quiz_type?: SortOrder
    content?: SortOrder
    content_mindmap?: SortOrder
    user_note?: SortOrder
    gist?: SortOrder
    content_type?: SortOrder
    job_type?: SortOrder
    hard?: SortOrder
    anki_note_id?: SortOrder
    time_create?: SortOrder
    time_update?: SortOrder
  }

  export type articleMinOrderByAggregateInput = {
    id?: SortOrder
    link?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
    title?: SortOrder
    quiz_type?: SortOrder
    content?: SortOrder
    content_mindmap?: SortOrder
    user_note?: SortOrder
    gist?: SortOrder
    content_type?: SortOrder
    job_type?: SortOrder
    hard?: SortOrder
    anki_note_id?: SortOrder
    time_create?: SortOrder
    time_update?: SortOrder
  }

  export type articleSumOrderByAggregateInput = {
    id?: SortOrder
    anki_note_id?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type Project_fileListRelationFilter = {
    every?: project_fileWhereInput
    some?: project_fileWhereInput
    none?: project_fileWhereInput
  }

  export type project_fileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type user_projectOrderByRelevanceInput = {
    fields: user_projectOrderByRelevanceFieldEnum | user_projectOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type user_projectUser_idProject_nameCompoundUniqueInput = {
    user_id: number
    project_name: string
  }

  export type user_projectCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    project_name?: SortOrder
  }

  export type user_projectAvgOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }

  export type user_projectMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    project_name?: SortOrder
  }

  export type user_projectMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    project_name?: SortOrder
  }

  export type user_projectSumOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }

  export type User_projectScalarRelationFilter = {
    is?: user_projectWhereInput
    isNot?: user_projectWhereInput
  }

  export type Project_file_chunkListRelationFilter = {
    every?: project_file_chunkWhereInput
    some?: project_file_chunkWhereInput
    none?: project_file_chunkWhereInput
  }

  export type project_file_chunkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type project_fileOrderByRelevanceInput = {
    fields: project_fileOrderByRelevanceFieldEnum | project_fileOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type project_fileUser_project_idFile_pathCompoundUniqueInput = {
    user_project_id: number
    file_path: string
  }

  export type project_fileCountOrderByAggregateInput = {
    id?: SortOrder
    file_path?: SortOrder
    hash?: SortOrder
    user_project_id?: SortOrder
  }

  export type project_fileAvgOrderByAggregateInput = {
    id?: SortOrder
    user_project_id?: SortOrder
  }

  export type project_fileMaxOrderByAggregateInput = {
    id?: SortOrder
    file_path?: SortOrder
    hash?: SortOrder
    user_project_id?: SortOrder
  }

  export type project_fileMinOrderByAggregateInput = {
    id?: SortOrder
    file_path?: SortOrder
    hash?: SortOrder
    user_project_id?: SortOrder
  }

  export type project_fileSumOrderByAggregateInput = {
    id?: SortOrder
    user_project_id?: SortOrder
  }

  export type Project_fileScalarRelationFilter = {
    is?: project_fileWhereInput
    isNot?: project_fileWhereInput
  }

  export type project_file_chunkOrderByRelevanceInput = {
    fields: project_file_chunkOrderByRelevanceFieldEnum | project_file_chunkOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type project_file_chunkCountOrderByAggregateInput = {
    id?: SortOrder
    project_file_id?: SortOrder
    vector_id?: SortOrder
  }

  export type project_file_chunkAvgOrderByAggregateInput = {
    id?: SortOrder
    project_file_id?: SortOrder
  }

  export type project_file_chunkMaxOrderByAggregateInput = {
    id?: SortOrder
    project_file_id?: SortOrder
    vector_id?: SortOrder
  }

  export type project_file_chunkMinOrderByAggregateInput = {
    id?: SortOrder
    project_file_id?: SortOrder
    vector_id?: SortOrder
  }

  export type project_file_chunkSumOrderByAggregateInput = {
    id?: SortOrder
    project_file_id?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ai_conversationOrderByRelevanceInput = {
    fields: ai_conversationOrderByRelevanceFieldEnum | ai_conversationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ai_conversationCountOrderByAggregateInput = {
    id?: SortOrder
    keyname?: SortOrder
    label?: SortOrder
    content?: SortOrder
    history?: SortOrder
    user_id?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
  }

  export type ai_conversationAvgOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }

  export type ai_conversationMaxOrderByAggregateInput = {
    id?: SortOrder
    keyname?: SortOrder
    label?: SortOrder
    user_id?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
  }

  export type ai_conversationMinOrderByAggregateInput = {
    id?: SortOrder
    keyname?: SortOrder
    label?: SortOrder
    user_id?: SortOrder
    create_at?: SortOrder
    update_at?: SortOrder
  }

  export type ai_conversationSumOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type user_articleCreateNestedManyWithoutUserInput = {
    create?: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput> | user_articleCreateWithoutUserInput[] | user_articleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutUserInput | user_articleCreateOrConnectWithoutUserInput[]
    createMany?: user_articleCreateManyUserInputEnvelope
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
  }

  export type ai_conversationCreateNestedManyWithoutUserInput = {
    create?: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput> | ai_conversationCreateWithoutUserInput[] | ai_conversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ai_conversationCreateOrConnectWithoutUserInput | ai_conversationCreateOrConnectWithoutUserInput[]
    createMany?: ai_conversationCreateManyUserInputEnvelope
    connect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
  }

  export type user_projectCreateNestedManyWithoutUserInput = {
    create?: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput> | user_projectCreateWithoutUserInput[] | user_projectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_projectCreateOrConnectWithoutUserInput | user_projectCreateOrConnectWithoutUserInput[]
    createMany?: user_projectCreateManyUserInputEnvelope
    connect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
  }

  export type user_articleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput> | user_articleCreateWithoutUserInput[] | user_articleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutUserInput | user_articleCreateOrConnectWithoutUserInput[]
    createMany?: user_articleCreateManyUserInputEnvelope
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
  }

  export type ai_conversationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput> | ai_conversationCreateWithoutUserInput[] | ai_conversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ai_conversationCreateOrConnectWithoutUserInput | ai_conversationCreateOrConnectWithoutUserInput[]
    createMany?: ai_conversationCreateManyUserInputEnvelope
    connect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
  }

  export type user_projectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput> | user_projectCreateWithoutUserInput[] | user_projectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_projectCreateOrConnectWithoutUserInput | user_projectCreateOrConnectWithoutUserInput[]
    createMany?: user_projectCreateManyUserInputEnvelope
    connect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type user_articleUpdateManyWithoutUserNestedInput = {
    create?: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput> | user_articleCreateWithoutUserInput[] | user_articleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutUserInput | user_articleCreateOrConnectWithoutUserInput[]
    upsert?: user_articleUpsertWithWhereUniqueWithoutUserInput | user_articleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: user_articleCreateManyUserInputEnvelope
    set?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    disconnect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    delete?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    update?: user_articleUpdateWithWhereUniqueWithoutUserInput | user_articleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: user_articleUpdateManyWithWhereWithoutUserInput | user_articleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
  }

  export type ai_conversationUpdateManyWithoutUserNestedInput = {
    create?: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput> | ai_conversationCreateWithoutUserInput[] | ai_conversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ai_conversationCreateOrConnectWithoutUserInput | ai_conversationCreateOrConnectWithoutUserInput[]
    upsert?: ai_conversationUpsertWithWhereUniqueWithoutUserInput | ai_conversationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ai_conversationCreateManyUserInputEnvelope
    set?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    disconnect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    delete?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    connect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    update?: ai_conversationUpdateWithWhereUniqueWithoutUserInput | ai_conversationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ai_conversationUpdateManyWithWhereWithoutUserInput | ai_conversationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ai_conversationScalarWhereInput | ai_conversationScalarWhereInput[]
  }

  export type user_projectUpdateManyWithoutUserNestedInput = {
    create?: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput> | user_projectCreateWithoutUserInput[] | user_projectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_projectCreateOrConnectWithoutUserInput | user_projectCreateOrConnectWithoutUserInput[]
    upsert?: user_projectUpsertWithWhereUniqueWithoutUserInput | user_projectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: user_projectCreateManyUserInputEnvelope
    set?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    disconnect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    delete?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    connect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    update?: user_projectUpdateWithWhereUniqueWithoutUserInput | user_projectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: user_projectUpdateManyWithWhereWithoutUserInput | user_projectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: user_projectScalarWhereInput | user_projectScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type user_articleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput> | user_articleCreateWithoutUserInput[] | user_articleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutUserInput | user_articleCreateOrConnectWithoutUserInput[]
    upsert?: user_articleUpsertWithWhereUniqueWithoutUserInput | user_articleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: user_articleCreateManyUserInputEnvelope
    set?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    disconnect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    delete?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    update?: user_articleUpdateWithWhereUniqueWithoutUserInput | user_articleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: user_articleUpdateManyWithWhereWithoutUserInput | user_articleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
  }

  export type ai_conversationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput> | ai_conversationCreateWithoutUserInput[] | ai_conversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ai_conversationCreateOrConnectWithoutUserInput | ai_conversationCreateOrConnectWithoutUserInput[]
    upsert?: ai_conversationUpsertWithWhereUniqueWithoutUserInput | ai_conversationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ai_conversationCreateManyUserInputEnvelope
    set?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    disconnect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    delete?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    connect?: ai_conversationWhereUniqueInput | ai_conversationWhereUniqueInput[]
    update?: ai_conversationUpdateWithWhereUniqueWithoutUserInput | ai_conversationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ai_conversationUpdateManyWithWhereWithoutUserInput | ai_conversationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ai_conversationScalarWhereInput | ai_conversationScalarWhereInput[]
  }

  export type user_projectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput> | user_projectCreateWithoutUserInput[] | user_projectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: user_projectCreateOrConnectWithoutUserInput | user_projectCreateOrConnectWithoutUserInput[]
    upsert?: user_projectUpsertWithWhereUniqueWithoutUserInput | user_projectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: user_projectCreateManyUserInputEnvelope
    set?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    disconnect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    delete?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    connect?: user_projectWhereUniqueInput | user_projectWhereUniqueInput[]
    update?: user_projectUpdateWithWhereUniqueWithoutUserInput | user_projectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: user_projectUpdateManyWithWhereWithoutUserInput | user_projectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: user_projectScalarWhereInput | user_projectScalarWhereInput[]
  }

  export type userCreateNestedOneWithoutUser_articlesInput = {
    create?: XOR<userCreateWithoutUser_articlesInput, userUncheckedCreateWithoutUser_articlesInput>
    connectOrCreate?: userCreateOrConnectWithoutUser_articlesInput
    connect?: userWhereUniqueInput
  }

  export type articleCreateNestedOneWithoutUser_articlesInput = {
    create?: XOR<articleCreateWithoutUser_articlesInput, articleUncheckedCreateWithoutUser_articlesInput>
    connectOrCreate?: articleCreateOrConnectWithoutUser_articlesInput
    connect?: articleWhereUniqueInput
  }

  export type userUpdateOneRequiredWithoutUser_articlesNestedInput = {
    create?: XOR<userCreateWithoutUser_articlesInput, userUncheckedCreateWithoutUser_articlesInput>
    connectOrCreate?: userCreateOrConnectWithoutUser_articlesInput
    upsert?: userUpsertWithoutUser_articlesInput
    connect?: userWhereUniqueInput
    update?: XOR<XOR<userUpdateToOneWithWhereWithoutUser_articlesInput, userUpdateWithoutUser_articlesInput>, userUncheckedUpdateWithoutUser_articlesInput>
  }

  export type articleUpdateOneRequiredWithoutUser_articlesNestedInput = {
    create?: XOR<articleCreateWithoutUser_articlesInput, articleUncheckedCreateWithoutUser_articlesInput>
    connectOrCreate?: articleCreateOrConnectWithoutUser_articlesInput
    upsert?: articleUpsertWithoutUser_articlesInput
    connect?: articleWhereUniqueInput
    update?: XOR<XOR<articleUpdateToOneWithWhereWithoutUser_articlesInput, articleUpdateWithoutUser_articlesInput>, articleUncheckedUpdateWithoutUser_articlesInput>
  }

  export type user_articleCreateNestedManyWithoutArticleInput = {
    create?: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput> | user_articleCreateWithoutArticleInput[] | user_articleUncheckedCreateWithoutArticleInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutArticleInput | user_articleCreateOrConnectWithoutArticleInput[]
    createMany?: user_articleCreateManyArticleInputEnvelope
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
  }

  export type user_articleUncheckedCreateNestedManyWithoutArticleInput = {
    create?: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput> | user_articleCreateWithoutArticleInput[] | user_articleUncheckedCreateWithoutArticleInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutArticleInput | user_articleCreateOrConnectWithoutArticleInput[]
    createMany?: user_articleCreateManyArticleInputEnvelope
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type user_articleUpdateManyWithoutArticleNestedInput = {
    create?: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput> | user_articleCreateWithoutArticleInput[] | user_articleUncheckedCreateWithoutArticleInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutArticleInput | user_articleCreateOrConnectWithoutArticleInput[]
    upsert?: user_articleUpsertWithWhereUniqueWithoutArticleInput | user_articleUpsertWithWhereUniqueWithoutArticleInput[]
    createMany?: user_articleCreateManyArticleInputEnvelope
    set?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    disconnect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    delete?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    update?: user_articleUpdateWithWhereUniqueWithoutArticleInput | user_articleUpdateWithWhereUniqueWithoutArticleInput[]
    updateMany?: user_articleUpdateManyWithWhereWithoutArticleInput | user_articleUpdateManyWithWhereWithoutArticleInput[]
    deleteMany?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
  }

  export type user_articleUncheckedUpdateManyWithoutArticleNestedInput = {
    create?: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput> | user_articleCreateWithoutArticleInput[] | user_articleUncheckedCreateWithoutArticleInput[]
    connectOrCreate?: user_articleCreateOrConnectWithoutArticleInput | user_articleCreateOrConnectWithoutArticleInput[]
    upsert?: user_articleUpsertWithWhereUniqueWithoutArticleInput | user_articleUpsertWithWhereUniqueWithoutArticleInput[]
    createMany?: user_articleCreateManyArticleInputEnvelope
    set?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    disconnect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    delete?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    connect?: user_articleWhereUniqueInput | user_articleWhereUniqueInput[]
    update?: user_articleUpdateWithWhereUniqueWithoutArticleInput | user_articleUpdateWithWhereUniqueWithoutArticleInput[]
    updateMany?: user_articleUpdateManyWithWhereWithoutArticleInput | user_articleUpdateManyWithWhereWithoutArticleInput[]
    deleteMany?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
  }

  export type project_fileCreateNestedManyWithoutUser_projectInput = {
    create?: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput> | project_fileCreateWithoutUser_projectInput[] | project_fileUncheckedCreateWithoutUser_projectInput[]
    connectOrCreate?: project_fileCreateOrConnectWithoutUser_projectInput | project_fileCreateOrConnectWithoutUser_projectInput[]
    createMany?: project_fileCreateManyUser_projectInputEnvelope
    connect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
  }

  export type userCreateNestedOneWithoutUser_projectInput = {
    create?: XOR<userCreateWithoutUser_projectInput, userUncheckedCreateWithoutUser_projectInput>
    connectOrCreate?: userCreateOrConnectWithoutUser_projectInput
    connect?: userWhereUniqueInput
  }

  export type project_fileUncheckedCreateNestedManyWithoutUser_projectInput = {
    create?: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput> | project_fileCreateWithoutUser_projectInput[] | project_fileUncheckedCreateWithoutUser_projectInput[]
    connectOrCreate?: project_fileCreateOrConnectWithoutUser_projectInput | project_fileCreateOrConnectWithoutUser_projectInput[]
    createMany?: project_fileCreateManyUser_projectInputEnvelope
    connect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
  }

  export type project_fileUpdateManyWithoutUser_projectNestedInput = {
    create?: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput> | project_fileCreateWithoutUser_projectInput[] | project_fileUncheckedCreateWithoutUser_projectInput[]
    connectOrCreate?: project_fileCreateOrConnectWithoutUser_projectInput | project_fileCreateOrConnectWithoutUser_projectInput[]
    upsert?: project_fileUpsertWithWhereUniqueWithoutUser_projectInput | project_fileUpsertWithWhereUniqueWithoutUser_projectInput[]
    createMany?: project_fileCreateManyUser_projectInputEnvelope
    set?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    disconnect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    delete?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    connect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    update?: project_fileUpdateWithWhereUniqueWithoutUser_projectInput | project_fileUpdateWithWhereUniqueWithoutUser_projectInput[]
    updateMany?: project_fileUpdateManyWithWhereWithoutUser_projectInput | project_fileUpdateManyWithWhereWithoutUser_projectInput[]
    deleteMany?: project_fileScalarWhereInput | project_fileScalarWhereInput[]
  }

  export type userUpdateOneRequiredWithoutUser_projectNestedInput = {
    create?: XOR<userCreateWithoutUser_projectInput, userUncheckedCreateWithoutUser_projectInput>
    connectOrCreate?: userCreateOrConnectWithoutUser_projectInput
    upsert?: userUpsertWithoutUser_projectInput
    connect?: userWhereUniqueInput
    update?: XOR<XOR<userUpdateToOneWithWhereWithoutUser_projectInput, userUpdateWithoutUser_projectInput>, userUncheckedUpdateWithoutUser_projectInput>
  }

  export type project_fileUncheckedUpdateManyWithoutUser_projectNestedInput = {
    create?: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput> | project_fileCreateWithoutUser_projectInput[] | project_fileUncheckedCreateWithoutUser_projectInput[]
    connectOrCreate?: project_fileCreateOrConnectWithoutUser_projectInput | project_fileCreateOrConnectWithoutUser_projectInput[]
    upsert?: project_fileUpsertWithWhereUniqueWithoutUser_projectInput | project_fileUpsertWithWhereUniqueWithoutUser_projectInput[]
    createMany?: project_fileCreateManyUser_projectInputEnvelope
    set?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    disconnect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    delete?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    connect?: project_fileWhereUniqueInput | project_fileWhereUniqueInput[]
    update?: project_fileUpdateWithWhereUniqueWithoutUser_projectInput | project_fileUpdateWithWhereUniqueWithoutUser_projectInput[]
    updateMany?: project_fileUpdateManyWithWhereWithoutUser_projectInput | project_fileUpdateManyWithWhereWithoutUser_projectInput[]
    deleteMany?: project_fileScalarWhereInput | project_fileScalarWhereInput[]
  }

  export type user_projectCreateNestedOneWithoutProject_fileInput = {
    create?: XOR<user_projectCreateWithoutProject_fileInput, user_projectUncheckedCreateWithoutProject_fileInput>
    connectOrCreate?: user_projectCreateOrConnectWithoutProject_fileInput
    connect?: user_projectWhereUniqueInput
  }

  export type project_file_chunkCreateNestedManyWithoutProject_fileInput = {
    create?: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput> | project_file_chunkCreateWithoutProject_fileInput[] | project_file_chunkUncheckedCreateWithoutProject_fileInput[]
    connectOrCreate?: project_file_chunkCreateOrConnectWithoutProject_fileInput | project_file_chunkCreateOrConnectWithoutProject_fileInput[]
    createMany?: project_file_chunkCreateManyProject_fileInputEnvelope
    connect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
  }

  export type project_file_chunkUncheckedCreateNestedManyWithoutProject_fileInput = {
    create?: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput> | project_file_chunkCreateWithoutProject_fileInput[] | project_file_chunkUncheckedCreateWithoutProject_fileInput[]
    connectOrCreate?: project_file_chunkCreateOrConnectWithoutProject_fileInput | project_file_chunkCreateOrConnectWithoutProject_fileInput[]
    createMany?: project_file_chunkCreateManyProject_fileInputEnvelope
    connect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
  }

  export type user_projectUpdateOneRequiredWithoutProject_fileNestedInput = {
    create?: XOR<user_projectCreateWithoutProject_fileInput, user_projectUncheckedCreateWithoutProject_fileInput>
    connectOrCreate?: user_projectCreateOrConnectWithoutProject_fileInput
    upsert?: user_projectUpsertWithoutProject_fileInput
    connect?: user_projectWhereUniqueInput
    update?: XOR<XOR<user_projectUpdateToOneWithWhereWithoutProject_fileInput, user_projectUpdateWithoutProject_fileInput>, user_projectUncheckedUpdateWithoutProject_fileInput>
  }

  export type project_file_chunkUpdateManyWithoutProject_fileNestedInput = {
    create?: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput> | project_file_chunkCreateWithoutProject_fileInput[] | project_file_chunkUncheckedCreateWithoutProject_fileInput[]
    connectOrCreate?: project_file_chunkCreateOrConnectWithoutProject_fileInput | project_file_chunkCreateOrConnectWithoutProject_fileInput[]
    upsert?: project_file_chunkUpsertWithWhereUniqueWithoutProject_fileInput | project_file_chunkUpsertWithWhereUniqueWithoutProject_fileInput[]
    createMany?: project_file_chunkCreateManyProject_fileInputEnvelope
    set?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    disconnect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    delete?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    connect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    update?: project_file_chunkUpdateWithWhereUniqueWithoutProject_fileInput | project_file_chunkUpdateWithWhereUniqueWithoutProject_fileInput[]
    updateMany?: project_file_chunkUpdateManyWithWhereWithoutProject_fileInput | project_file_chunkUpdateManyWithWhereWithoutProject_fileInput[]
    deleteMany?: project_file_chunkScalarWhereInput | project_file_chunkScalarWhereInput[]
  }

  export type project_file_chunkUncheckedUpdateManyWithoutProject_fileNestedInput = {
    create?: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput> | project_file_chunkCreateWithoutProject_fileInput[] | project_file_chunkUncheckedCreateWithoutProject_fileInput[]
    connectOrCreate?: project_file_chunkCreateOrConnectWithoutProject_fileInput | project_file_chunkCreateOrConnectWithoutProject_fileInput[]
    upsert?: project_file_chunkUpsertWithWhereUniqueWithoutProject_fileInput | project_file_chunkUpsertWithWhereUniqueWithoutProject_fileInput[]
    createMany?: project_file_chunkCreateManyProject_fileInputEnvelope
    set?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    disconnect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    delete?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    connect?: project_file_chunkWhereUniqueInput | project_file_chunkWhereUniqueInput[]
    update?: project_file_chunkUpdateWithWhereUniqueWithoutProject_fileInput | project_file_chunkUpdateWithWhereUniqueWithoutProject_fileInput[]
    updateMany?: project_file_chunkUpdateManyWithWhereWithoutProject_fileInput | project_file_chunkUpdateManyWithWhereWithoutProject_fileInput[]
    deleteMany?: project_file_chunkScalarWhereInput | project_file_chunkScalarWhereInput[]
  }

  export type project_fileCreateNestedOneWithoutChunksInput = {
    create?: XOR<project_fileCreateWithoutChunksInput, project_fileUncheckedCreateWithoutChunksInput>
    connectOrCreate?: project_fileCreateOrConnectWithoutChunksInput
    connect?: project_fileWhereUniqueInput
  }

  export type project_fileUpdateOneRequiredWithoutChunksNestedInput = {
    create?: XOR<project_fileCreateWithoutChunksInput, project_fileUncheckedCreateWithoutChunksInput>
    connectOrCreate?: project_fileCreateOrConnectWithoutChunksInput
    upsert?: project_fileUpsertWithoutChunksInput
    connect?: project_fileWhereUniqueInput
    update?: XOR<XOR<project_fileUpdateToOneWithWhereWithoutChunksInput, project_fileUpdateWithoutChunksInput>, project_fileUncheckedUpdateWithoutChunksInput>
  }

  export type userCreateNestedOneWithoutAi_conversationInput = {
    create?: XOR<userCreateWithoutAi_conversationInput, userUncheckedCreateWithoutAi_conversationInput>
    connectOrCreate?: userCreateOrConnectWithoutAi_conversationInput
    connect?: userWhereUniqueInput
  }

  export type userUpdateOneRequiredWithoutAi_conversationNestedInput = {
    create?: XOR<userCreateWithoutAi_conversationInput, userUncheckedCreateWithoutAi_conversationInput>
    connectOrCreate?: userCreateOrConnectWithoutAi_conversationInput
    upsert?: userUpsertWithoutAi_conversationInput
    connect?: userWhereUniqueInput
    update?: XOR<XOR<userUpdateToOneWithWhereWithoutAi_conversationInput, userUpdateWithoutAi_conversationInput>, userUncheckedUpdateWithoutAi_conversationInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type user_articleCreateWithoutUserInput = {
    article: articleCreateNestedOneWithoutUser_articlesInput
  }

  export type user_articleUncheckedCreateWithoutUserInput = {
    id?: number
    article_id: number
  }

  export type user_articleCreateOrConnectWithoutUserInput = {
    where: user_articleWhereUniqueInput
    create: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput>
  }

  export type user_articleCreateManyUserInputEnvelope = {
    data: user_articleCreateManyUserInput | user_articleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ai_conversationCreateWithoutUserInput = {
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: Date | string | null
    update_at?: Date | string | null
  }

  export type ai_conversationUncheckedCreateWithoutUserInput = {
    id?: number
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: Date | string | null
    update_at?: Date | string | null
  }

  export type ai_conversationCreateOrConnectWithoutUserInput = {
    where: ai_conversationWhereUniqueInput
    create: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput>
  }

  export type ai_conversationCreateManyUserInputEnvelope = {
    data: ai_conversationCreateManyUserInput | ai_conversationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type user_projectCreateWithoutUserInput = {
    project_name: string
    project_file?: project_fileCreateNestedManyWithoutUser_projectInput
  }

  export type user_projectUncheckedCreateWithoutUserInput = {
    id?: number
    project_name: string
    project_file?: project_fileUncheckedCreateNestedManyWithoutUser_projectInput
  }

  export type user_projectCreateOrConnectWithoutUserInput = {
    where: user_projectWhereUniqueInput
    create: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput>
  }

  export type user_projectCreateManyUserInputEnvelope = {
    data: user_projectCreateManyUserInput | user_projectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type user_articleUpsertWithWhereUniqueWithoutUserInput = {
    where: user_articleWhereUniqueInput
    update: XOR<user_articleUpdateWithoutUserInput, user_articleUncheckedUpdateWithoutUserInput>
    create: XOR<user_articleCreateWithoutUserInput, user_articleUncheckedCreateWithoutUserInput>
  }

  export type user_articleUpdateWithWhereUniqueWithoutUserInput = {
    where: user_articleWhereUniqueInput
    data: XOR<user_articleUpdateWithoutUserInput, user_articleUncheckedUpdateWithoutUserInput>
  }

  export type user_articleUpdateManyWithWhereWithoutUserInput = {
    where: user_articleScalarWhereInput
    data: XOR<user_articleUpdateManyMutationInput, user_articleUncheckedUpdateManyWithoutUserInput>
  }

  export type user_articleScalarWhereInput = {
    AND?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
    OR?: user_articleScalarWhereInput[]
    NOT?: user_articleScalarWhereInput | user_articleScalarWhereInput[]
    id?: IntFilter<"user_article"> | number
    user_id?: IntFilter<"user_article"> | number
    article_id?: IntFilter<"user_article"> | number
  }

  export type ai_conversationUpsertWithWhereUniqueWithoutUserInput = {
    where: ai_conversationWhereUniqueInput
    update: XOR<ai_conversationUpdateWithoutUserInput, ai_conversationUncheckedUpdateWithoutUserInput>
    create: XOR<ai_conversationCreateWithoutUserInput, ai_conversationUncheckedCreateWithoutUserInput>
  }

  export type ai_conversationUpdateWithWhereUniqueWithoutUserInput = {
    where: ai_conversationWhereUniqueInput
    data: XOR<ai_conversationUpdateWithoutUserInput, ai_conversationUncheckedUpdateWithoutUserInput>
  }

  export type ai_conversationUpdateManyWithWhereWithoutUserInput = {
    where: ai_conversationScalarWhereInput
    data: XOR<ai_conversationUpdateManyMutationInput, ai_conversationUncheckedUpdateManyWithoutUserInput>
  }

  export type ai_conversationScalarWhereInput = {
    AND?: ai_conversationScalarWhereInput | ai_conversationScalarWhereInput[]
    OR?: ai_conversationScalarWhereInput[]
    NOT?: ai_conversationScalarWhereInput | ai_conversationScalarWhereInput[]
    id?: IntFilter<"ai_conversation"> | number
    keyname?: StringFilter<"ai_conversation"> | string
    label?: StringFilter<"ai_conversation"> | string
    content?: JsonNullableFilter<"ai_conversation">
    history?: JsonNullableFilter<"ai_conversation">
    user_id?: IntFilter<"ai_conversation"> | number
    create_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
    update_at?: DateTimeNullableFilter<"ai_conversation"> | Date | string | null
  }

  export type user_projectUpsertWithWhereUniqueWithoutUserInput = {
    where: user_projectWhereUniqueInput
    update: XOR<user_projectUpdateWithoutUserInput, user_projectUncheckedUpdateWithoutUserInput>
    create: XOR<user_projectCreateWithoutUserInput, user_projectUncheckedCreateWithoutUserInput>
  }

  export type user_projectUpdateWithWhereUniqueWithoutUserInput = {
    where: user_projectWhereUniqueInput
    data: XOR<user_projectUpdateWithoutUserInput, user_projectUncheckedUpdateWithoutUserInput>
  }

  export type user_projectUpdateManyWithWhereWithoutUserInput = {
    where: user_projectScalarWhereInput
    data: XOR<user_projectUpdateManyMutationInput, user_projectUncheckedUpdateManyWithoutUserInput>
  }

  export type user_projectScalarWhereInput = {
    AND?: user_projectScalarWhereInput | user_projectScalarWhereInput[]
    OR?: user_projectScalarWhereInput[]
    NOT?: user_projectScalarWhereInput | user_projectScalarWhereInput[]
    id?: IntFilter<"user_project"> | number
    user_id?: IntFilter<"user_project"> | number
    project_name?: StringFilter<"user_project"> | string
  }

  export type userCreateWithoutUser_articlesInput = {
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    ai_conversation?: ai_conversationCreateNestedManyWithoutUserInput
    user_project?: user_projectCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateWithoutUser_articlesInput = {
    id?: number
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    ai_conversation?: ai_conversationUncheckedCreateNestedManyWithoutUserInput
    user_project?: user_projectUncheckedCreateNestedManyWithoutUserInput
  }

  export type userCreateOrConnectWithoutUser_articlesInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutUser_articlesInput, userUncheckedCreateWithoutUser_articlesInput>
  }

  export type articleCreateWithoutUser_articlesInput = {
    link: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    title: string
    quiz_type: string
    content: string
    content_mindmap?: string | null
    user_note?: string | null
    gist: string
    content_type: string
    job_type?: string | null
    hard: string
    anki_note_id?: bigint | number | null
    time_create?: Date | string | null
    time_update?: Date | string | null
  }

  export type articleUncheckedCreateWithoutUser_articlesInput = {
    id?: number
    link: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    title: string
    quiz_type: string
    content: string
    content_mindmap?: string | null
    user_note?: string | null
    gist: string
    content_type: string
    job_type?: string | null
    hard: string
    anki_note_id?: bigint | number | null
    time_create?: Date | string | null
    time_update?: Date | string | null
  }

  export type articleCreateOrConnectWithoutUser_articlesInput = {
    where: articleWhereUniqueInput
    create: XOR<articleCreateWithoutUser_articlesInput, articleUncheckedCreateWithoutUser_articlesInput>
  }

  export type userUpsertWithoutUser_articlesInput = {
    update: XOR<userUpdateWithoutUser_articlesInput, userUncheckedUpdateWithoutUser_articlesInput>
    create: XOR<userCreateWithoutUser_articlesInput, userUncheckedCreateWithoutUser_articlesInput>
    where?: userWhereInput
  }

  export type userUpdateToOneWithWhereWithoutUser_articlesInput = {
    where?: userWhereInput
    data: XOR<userUpdateWithoutUser_articlesInput, userUncheckedUpdateWithoutUser_articlesInput>
  }

  export type userUpdateWithoutUser_articlesInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    ai_conversation?: ai_conversationUpdateManyWithoutUserNestedInput
    user_project?: user_projectUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateWithoutUser_articlesInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    ai_conversation?: ai_conversationUncheckedUpdateManyWithoutUserNestedInput
    user_project?: user_projectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type articleUpsertWithoutUser_articlesInput = {
    update: XOR<articleUpdateWithoutUser_articlesInput, articleUncheckedUpdateWithoutUser_articlesInput>
    create: XOR<articleCreateWithoutUser_articlesInput, articleUncheckedCreateWithoutUser_articlesInput>
    where?: articleWhereInput
  }

  export type articleUpdateToOneWithWhereWithoutUser_articlesInput = {
    where?: articleWhereInput
    data: XOR<articleUpdateWithoutUser_articlesInput, articleUncheckedUpdateWithoutUser_articlesInput>
  }

  export type articleUpdateWithoutUser_articlesInput = {
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type articleUncheckedUpdateWithoutUser_articlesInput = {
    id?: IntFieldUpdateOperationsInput | number
    link?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    quiz_type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    content_mindmap?: NullableStringFieldUpdateOperationsInput | string | null
    user_note?: NullableStringFieldUpdateOperationsInput | string | null
    gist?: StringFieldUpdateOperationsInput | string
    content_type?: StringFieldUpdateOperationsInput | string
    job_type?: NullableStringFieldUpdateOperationsInput | string | null
    hard?: StringFieldUpdateOperationsInput | string
    anki_note_id?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    time_create?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    time_update?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type user_articleCreateWithoutArticleInput = {
    user: userCreateNestedOneWithoutUser_articlesInput
  }

  export type user_articleUncheckedCreateWithoutArticleInput = {
    id?: number
    user_id: number
  }

  export type user_articleCreateOrConnectWithoutArticleInput = {
    where: user_articleWhereUniqueInput
    create: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput>
  }

  export type user_articleCreateManyArticleInputEnvelope = {
    data: user_articleCreateManyArticleInput | user_articleCreateManyArticleInput[]
    skipDuplicates?: boolean
  }

  export type user_articleUpsertWithWhereUniqueWithoutArticleInput = {
    where: user_articleWhereUniqueInput
    update: XOR<user_articleUpdateWithoutArticleInput, user_articleUncheckedUpdateWithoutArticleInput>
    create: XOR<user_articleCreateWithoutArticleInput, user_articleUncheckedCreateWithoutArticleInput>
  }

  export type user_articleUpdateWithWhereUniqueWithoutArticleInput = {
    where: user_articleWhereUniqueInput
    data: XOR<user_articleUpdateWithoutArticleInput, user_articleUncheckedUpdateWithoutArticleInput>
  }

  export type user_articleUpdateManyWithWhereWithoutArticleInput = {
    where: user_articleScalarWhereInput
    data: XOR<user_articleUpdateManyMutationInput, user_articleUncheckedUpdateManyWithoutArticleInput>
  }

  export type project_fileCreateWithoutUser_projectInput = {
    file_path: string
    hash: string
    chunks?: project_file_chunkCreateNestedManyWithoutProject_fileInput
  }

  export type project_fileUncheckedCreateWithoutUser_projectInput = {
    id?: number
    file_path: string
    hash: string
    chunks?: project_file_chunkUncheckedCreateNestedManyWithoutProject_fileInput
  }

  export type project_fileCreateOrConnectWithoutUser_projectInput = {
    where: project_fileWhereUniqueInput
    create: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput>
  }

  export type project_fileCreateManyUser_projectInputEnvelope = {
    data: project_fileCreateManyUser_projectInput | project_fileCreateManyUser_projectInput[]
    skipDuplicates?: boolean
  }

  export type userCreateWithoutUser_projectInput = {
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleCreateNestedManyWithoutUserInput
    ai_conversation?: ai_conversationCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateWithoutUser_projectInput = {
    id?: number
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleUncheckedCreateNestedManyWithoutUserInput
    ai_conversation?: ai_conversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type userCreateOrConnectWithoutUser_projectInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutUser_projectInput, userUncheckedCreateWithoutUser_projectInput>
  }

  export type project_fileUpsertWithWhereUniqueWithoutUser_projectInput = {
    where: project_fileWhereUniqueInput
    update: XOR<project_fileUpdateWithoutUser_projectInput, project_fileUncheckedUpdateWithoutUser_projectInput>
    create: XOR<project_fileCreateWithoutUser_projectInput, project_fileUncheckedCreateWithoutUser_projectInput>
  }

  export type project_fileUpdateWithWhereUniqueWithoutUser_projectInput = {
    where: project_fileWhereUniqueInput
    data: XOR<project_fileUpdateWithoutUser_projectInput, project_fileUncheckedUpdateWithoutUser_projectInput>
  }

  export type project_fileUpdateManyWithWhereWithoutUser_projectInput = {
    where: project_fileScalarWhereInput
    data: XOR<project_fileUpdateManyMutationInput, project_fileUncheckedUpdateManyWithoutUser_projectInput>
  }

  export type project_fileScalarWhereInput = {
    AND?: project_fileScalarWhereInput | project_fileScalarWhereInput[]
    OR?: project_fileScalarWhereInput[]
    NOT?: project_fileScalarWhereInput | project_fileScalarWhereInput[]
    id?: IntFilter<"project_file"> | number
    file_path?: StringFilter<"project_file"> | string
    hash?: StringFilter<"project_file"> | string
    user_project_id?: IntFilter<"project_file"> | number
  }

  export type userUpsertWithoutUser_projectInput = {
    update: XOR<userUpdateWithoutUser_projectInput, userUncheckedUpdateWithoutUser_projectInput>
    create: XOR<userCreateWithoutUser_projectInput, userUncheckedCreateWithoutUser_projectInput>
    where?: userWhereInput
  }

  export type userUpdateToOneWithWhereWithoutUser_projectInput = {
    where?: userWhereInput
    data: XOR<userUpdateWithoutUser_projectInput, userUncheckedUpdateWithoutUser_projectInput>
  }

  export type userUpdateWithoutUser_projectInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUpdateManyWithoutUserNestedInput
    ai_conversation?: ai_conversationUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateWithoutUser_projectInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUncheckedUpdateManyWithoutUserNestedInput
    ai_conversation?: ai_conversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type user_projectCreateWithoutProject_fileInput = {
    project_name: string
    user: userCreateNestedOneWithoutUser_projectInput
  }

  export type user_projectUncheckedCreateWithoutProject_fileInput = {
    id?: number
    user_id: number
    project_name: string
  }

  export type user_projectCreateOrConnectWithoutProject_fileInput = {
    where: user_projectWhereUniqueInput
    create: XOR<user_projectCreateWithoutProject_fileInput, user_projectUncheckedCreateWithoutProject_fileInput>
  }

  export type project_file_chunkCreateWithoutProject_fileInput = {
    vector_id: string
  }

  export type project_file_chunkUncheckedCreateWithoutProject_fileInput = {
    id?: number
    vector_id: string
  }

  export type project_file_chunkCreateOrConnectWithoutProject_fileInput = {
    where: project_file_chunkWhereUniqueInput
    create: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput>
  }

  export type project_file_chunkCreateManyProject_fileInputEnvelope = {
    data: project_file_chunkCreateManyProject_fileInput | project_file_chunkCreateManyProject_fileInput[]
    skipDuplicates?: boolean
  }

  export type user_projectUpsertWithoutProject_fileInput = {
    update: XOR<user_projectUpdateWithoutProject_fileInput, user_projectUncheckedUpdateWithoutProject_fileInput>
    create: XOR<user_projectCreateWithoutProject_fileInput, user_projectUncheckedCreateWithoutProject_fileInput>
    where?: user_projectWhereInput
  }

  export type user_projectUpdateToOneWithWhereWithoutProject_fileInput = {
    where?: user_projectWhereInput
    data: XOR<user_projectUpdateWithoutProject_fileInput, user_projectUncheckedUpdateWithoutProject_fileInput>
  }

  export type user_projectUpdateWithoutProject_fileInput = {
    project_name?: StringFieldUpdateOperationsInput | string
    user?: userUpdateOneRequiredWithoutUser_projectNestedInput
  }

  export type user_projectUncheckedUpdateWithoutProject_fileInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    project_name?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkUpsertWithWhereUniqueWithoutProject_fileInput = {
    where: project_file_chunkWhereUniqueInput
    update: XOR<project_file_chunkUpdateWithoutProject_fileInput, project_file_chunkUncheckedUpdateWithoutProject_fileInput>
    create: XOR<project_file_chunkCreateWithoutProject_fileInput, project_file_chunkUncheckedCreateWithoutProject_fileInput>
  }

  export type project_file_chunkUpdateWithWhereUniqueWithoutProject_fileInput = {
    where: project_file_chunkWhereUniqueInput
    data: XOR<project_file_chunkUpdateWithoutProject_fileInput, project_file_chunkUncheckedUpdateWithoutProject_fileInput>
  }

  export type project_file_chunkUpdateManyWithWhereWithoutProject_fileInput = {
    where: project_file_chunkScalarWhereInput
    data: XOR<project_file_chunkUpdateManyMutationInput, project_file_chunkUncheckedUpdateManyWithoutProject_fileInput>
  }

  export type project_file_chunkScalarWhereInput = {
    AND?: project_file_chunkScalarWhereInput | project_file_chunkScalarWhereInput[]
    OR?: project_file_chunkScalarWhereInput[]
    NOT?: project_file_chunkScalarWhereInput | project_file_chunkScalarWhereInput[]
    id?: IntFilter<"project_file_chunk"> | number
    project_file_id?: IntFilter<"project_file_chunk"> | number
    vector_id?: StringFilter<"project_file_chunk"> | string
  }

  export type project_fileCreateWithoutChunksInput = {
    file_path: string
    hash: string
    user_project: user_projectCreateNestedOneWithoutProject_fileInput
  }

  export type project_fileUncheckedCreateWithoutChunksInput = {
    id?: number
    file_path: string
    hash: string
    user_project_id: number
  }

  export type project_fileCreateOrConnectWithoutChunksInput = {
    where: project_fileWhereUniqueInput
    create: XOR<project_fileCreateWithoutChunksInput, project_fileUncheckedCreateWithoutChunksInput>
  }

  export type project_fileUpsertWithoutChunksInput = {
    update: XOR<project_fileUpdateWithoutChunksInput, project_fileUncheckedUpdateWithoutChunksInput>
    create: XOR<project_fileCreateWithoutChunksInput, project_fileUncheckedCreateWithoutChunksInput>
    where?: project_fileWhereInput
  }

  export type project_fileUpdateToOneWithWhereWithoutChunksInput = {
    where?: project_fileWhereInput
    data: XOR<project_fileUpdateWithoutChunksInput, project_fileUncheckedUpdateWithoutChunksInput>
  }

  export type project_fileUpdateWithoutChunksInput = {
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    user_project?: user_projectUpdateOneRequiredWithoutProject_fileNestedInput
  }

  export type project_fileUncheckedUpdateWithoutChunksInput = {
    id?: IntFieldUpdateOperationsInput | number
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    user_project_id?: IntFieldUpdateOperationsInput | number
  }

  export type userCreateWithoutAi_conversationInput = {
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleCreateNestedManyWithoutUserInput
    user_project?: user_projectCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateWithoutAi_conversationInput = {
    id?: number
    username: string
    password: string
    create_at?: Date | string | null
    update_at?: Date | string | null
    email: string
    user_articles?: user_articleUncheckedCreateNestedManyWithoutUserInput
    user_project?: user_projectUncheckedCreateNestedManyWithoutUserInput
  }

  export type userCreateOrConnectWithoutAi_conversationInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutAi_conversationInput, userUncheckedCreateWithoutAi_conversationInput>
  }

  export type userUpsertWithoutAi_conversationInput = {
    update: XOR<userUpdateWithoutAi_conversationInput, userUncheckedUpdateWithoutAi_conversationInput>
    create: XOR<userCreateWithoutAi_conversationInput, userUncheckedCreateWithoutAi_conversationInput>
    where?: userWhereInput
  }

  export type userUpdateToOneWithWhereWithoutAi_conversationInput = {
    where?: userWhereInput
    data: XOR<userUpdateWithoutAi_conversationInput, userUncheckedUpdateWithoutAi_conversationInput>
  }

  export type userUpdateWithoutAi_conversationInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUpdateManyWithoutUserNestedInput
    user_project?: user_projectUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateWithoutAi_conversationInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: StringFieldUpdateOperationsInput | string
    user_articles?: user_articleUncheckedUpdateManyWithoutUserNestedInput
    user_project?: user_projectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type user_articleCreateManyUserInput = {
    id?: number
    article_id: number
  }

  export type ai_conversationCreateManyUserInput = {
    id?: number
    keyname: string
    label: string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: Date | string | null
    update_at?: Date | string | null
  }

  export type user_projectCreateManyUserInput = {
    id?: number
    project_name: string
  }

  export type user_articleUpdateWithoutUserInput = {
    article?: articleUpdateOneRequiredWithoutUser_articlesNestedInput
  }

  export type user_articleUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    article_id?: IntFieldUpdateOperationsInput | number
  }

  export type user_articleUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    article_id?: IntFieldUpdateOperationsInput | number
  }

  export type ai_conversationUpdateWithoutUserInput = {
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ai_conversationUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ai_conversationUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    keyname?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    history?: NullableJsonNullValueInput | InputJsonValue
    create_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    update_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type user_projectUpdateWithoutUserInput = {
    project_name?: StringFieldUpdateOperationsInput | string
    project_file?: project_fileUpdateManyWithoutUser_projectNestedInput
  }

  export type user_projectUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    project_name?: StringFieldUpdateOperationsInput | string
    project_file?: project_fileUncheckedUpdateManyWithoutUser_projectNestedInput
  }

  export type user_projectUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    project_name?: StringFieldUpdateOperationsInput | string
  }

  export type user_articleCreateManyArticleInput = {
    id?: number
    user_id: number
  }

  export type user_articleUpdateWithoutArticleInput = {
    user?: userUpdateOneRequiredWithoutUser_articlesNestedInput
  }

  export type user_articleUncheckedUpdateWithoutArticleInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
  }

  export type user_articleUncheckedUpdateManyWithoutArticleInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
  }

  export type project_fileCreateManyUser_projectInput = {
    id?: number
    file_path: string
    hash: string
  }

  export type project_fileUpdateWithoutUser_projectInput = {
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    chunks?: project_file_chunkUpdateManyWithoutProject_fileNestedInput
  }

  export type project_fileUncheckedUpdateWithoutUser_projectInput = {
    id?: IntFieldUpdateOperationsInput | number
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    chunks?: project_file_chunkUncheckedUpdateManyWithoutProject_fileNestedInput
  }

  export type project_fileUncheckedUpdateManyWithoutUser_projectInput = {
    id?: IntFieldUpdateOperationsInput | number
    file_path?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkCreateManyProject_fileInput = {
    id?: number
    vector_id: string
  }

  export type project_file_chunkUpdateWithoutProject_fileInput = {
    vector_id?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkUncheckedUpdateWithoutProject_fileInput = {
    id?: IntFieldUpdateOperationsInput | number
    vector_id?: StringFieldUpdateOperationsInput | string
  }

  export type project_file_chunkUncheckedUpdateManyWithoutProject_fileInput = {
    id?: IntFieldUpdateOperationsInput | number
    vector_id?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}