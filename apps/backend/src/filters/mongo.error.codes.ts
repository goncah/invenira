const errorCodeToHttpStatus: Record<number, number> = {
  1: 500, // InternalError
  2: 400, // BadValue
  4: 404, // NoSuchKey
  5: 400, // GraphContainsCycle
  6: 503, // HostUnreachable
  7: 404, // HostNotFound
  8: 500, // UnknownError
  9: 400, // FailedToParse
  10: 400, // CannotMutateObject
  11: 404, // UserNotFound
  12: 415, // UnsupportedFormat
  13: 401, // Unauthorized
  14: 400, // TypeMismatch
  15: 400, // Overflow
  16: 400, // InvalidLength
  17: 400, // ProtocolError
  18: 401, // AuthenticationFailed
  19: 400, // CannotReuseObject
  20: 403, // IllegalOperation
  21: 400, // EmptyArrayOperation
  22: 400, // InvalidBSON
  23: 400, // AlreadyInitialized
  24: 408, // LockTimeout
  25: 400, // RemoteValidationError
  26: 404, // NamespaceNotFound
  27: 404, // IndexNotFound
  28: 400, // PathNotViable
  29: 404, // NonExistentPath
  30: 400, // InvalidPath
  31: 404, // RoleNotFound
  32: 400, // RolesNotRelated
  33: 404, // PrivilegeNotFound
  34: 400, // CannotBackfillArray
  35: 400, // UserModificationFailed
  36: 409, // RemoteChangeDetected
  37: 500, // FileRenameFailed
  38: 500, // FileNotOpen
  39: 500, // FileStreamFailed
  40: 400, // ConflictingUpdateOperators
  41: 400, // FileAlreadyOpen
  42: 500, // LogWriteFailed
  43: 404, // CursorNotFound
  45: 409, // UserDataInconsistent
  46: 423, // LockBusy
  47: 404, // NoMatchingDocument
  48: 409, // NamespaceExists
  49: 400, // InvalidRoleModification
  50: 503, // MaxTimeMSExpired
  51: 500, // ManualInterventionRequired
  52: 400, // DollarPrefixedFieldName
  53: 400, // InvalidIdField
  54: 400, // NotSingleValueField
  55: 400, // InvalidDBRef
  56: 400, // EmptyFieldName
  57: 400, // DottedFieldName
  58: 400, // RoleModificationFailed
  59: 404, // CommandNotFound
  61: 404, // ShardKeyNotFound
  62: 405, // OplogOperationUnsupported
  63: 409, // StaleShardVersion
  64: 500, // WriteConcernFailed
  65: 500, // MultipleErrorsOccurred
  66: 400, // ImmutableField
  67: 400, // CannotCreateIndex
  68: 409, // IndexAlreadyExists
  69: 500, // AuthSchemaIncompatible
  70: 404, // ShardNotFound
  71: 404, // ReplicaSetNotFound
  72: 400, // InvalidOptions
  73: 400, // InvalidNamespace
  74: 404, // NodeNotFound
  75: 200, // WriteConcernLegacyOK
  76: 503, // NoReplicationEnabled
  77: 500, // OperationIncomplete
  78: 500, // CommandResultSchemaViolation
  79: 500, // UnknownReplWriteConcern
  80: 409, // RoleDataInconsistent
  81: 500, // NoMatchParseContext
  82: 400, // NoProgressMade
  83: 500, // RemoteResultsUnavailable
  85: 409, // IndexOptionsConflict
  86: 409, // IndexKeySpecsConflict
  87: 400, // CannotSplit
  89: 503, // NetworkTimeout
  90: 500, // CallbackCanceled
  91: 500, // ShutdownInProgress
  92: 500, // SecondaryAheadOfPrimary
  93: 500, // InvalidReplicaSetConfig
  94: 500, // NotYetInitialized
  95: 500, // NotSecondary
  96: 405, // OperationFailed
  97: 404, // NoProjectionFound
  98: 500, // DBPathInUse
  100: 500, // UnsatisfiableWriteConcern
  101: 500, // OutdatedClient
  102: 400, // IncompatibleAuditMetadata
  103: 500, // NewReplicaSetConfigurationIncompatible
  104: 500, // NodeNotElectable
  105: 500, // IncompatibleShardingMetadata
  106: 500, // DistributedClockSkewed
  107: 500, // LockFailed
  108: 500, // InconsistentReplicaSetNames
  109: 500, // ConfigurationInProgress
  110: 500, // CannotInitializeNodeWithData
  111: 400, // NotExactValueField
  112: 409, // WriteConflict
  113: 500, // InitialSyncFailure
  114: 404, // InitialSyncOplogSourceMissing
  115: 405, // CommandNotSupported
  116: 400, // DocTooLargeForCapped
  117: 409, // ConflictingOperationInProgress
  118: 404, // NamespaceNotSharded
  119: 400, // InvalidSyncSource
  120: 404, // OplogStartMissing
  121: 400, // DocumentValidationFailure
  123: 500, // NotAReplicaSet
  124: 400, // IncompatibleElectionProtocol
  125: 400, // CommandFailed
  126: 400, // RPCProtocolNegotiationFailed
  127: 500, // UnrecoverableRollbackError
  128: 404, // LockNotFound
  129: 500, // LockStateChangeFailed
  130: 400, // SymbolNotFound
  133: 500, // FailedToSatisfyReadPreference
  134: 503, // ReadConcernMajorityNotAvailableYet
  135: 409, // StaleTerm
  136: 404, // CappedPositionLost
  137: 500, // IncompatibleShardingConfigVersion
  138: 500, // RemoteOplogStale
  139: 500, // JSInterpreterFailure
  140: 500, // InvalidSSLConfiguration
  141: 500, // SSLHandshakeFailed
  142: 500, // JSUncatchableError
  143: 400, // CursorInUse
  144: 500, // IncompatibleCatalogManager
  145: 503, // PooledConnectionsDropped
  146: 500, // ExceededMemoryLimit
  147: 500, // ZLibError
  148: 503, // ReadConcernMajorityNotEnabled
  149: 500, // NoConfigPrimary
  150: 409, // StaleEpoch
  151: 400, // OperationCannotBeBatched
  152: 400, // OplogOutOfOrder
  153: 413, // ChunkTooBig
  154: 500, // InconsistentShardIdentity
  155: 500, // CannotApplyOplogWhilePrimary
  157: 400, // CanRepairToDowngrade
  158: 400, // MustUpgrade
  159: 400, // DurationOverflow
  160: 400, // MaxStalenessOutOfRange
  161: 400, // IncompatibleCollationVersion
  162: 400, // CollectionIsEmpty
  163: 400, // ZoneStillInUse
  164: 400, // InitialSyncActive
  165: 400, // ViewDepthLimitExceeded
  166: 405, // CommandNotSupportedOnView
  167: 400, // OptionNotSupportedOnView
  168: 400, // InvalidPipelineOperator
  169: 400, // CommandOnShardedViewNotSupportedOnMongod
  170: 400, // TooManyMatchingDocuments
  171: 400, // CannotIndexParallelArrays
  172: 503, // TransportSessionClosed
  173: 404, // TransportSessionNotFound
  174: 404, // TransportSessionUnknown
  175: 500, // QueryPlanKilled
  176: 500, // FileOpenFailed
  177: 404, // ZoneNotFound
  178: 409, // RangeOverlapConflict
  179: 500, // WindowsPdhError
  180: 500, // BadPerfCounterPath
  181: 400, // AmbiguousIndexKeyPattern
  182: 400, // InvalidViewDefinition
  183: 400, // ClientMetadataMissingField
  184: 400, // ClientMetadataAppNameTooLarge
  185: 400, // ClientMetadataDocumentTooLarge
  186: 400, // ClientMetadataCannotBeMutated
  187: 400, // LinearizableReadConcernError
  188: 400, // IncompatibleServerVersion
  189: 500, // PrimarySteppedDown
  190: 500, // MasterSlaveConnectionFailure
  192: 200, // FailPointEnabled
  193: 400, // NoShardingEnabled
  194: 500, // BalancerInterrupted
  195: 400, // ViewPipelineMaxSizeExceeded
  197: 400, // InvalidIndexSpecificationOption
  199: 500, // ReplicaSetMonitorRemoved
  200: 500, // ChunkRangeCleanupPending
  201: 500, // CannotBuildIndexKeys
  202: 408, // NetworkInterfaceExceededTimeLimit
  203: 500, // ShardingStateNotInitialized
  204: 400, // TimeProofMismatch
  205: 400, // ClusterTimeFailsRateLimiter
  206: 404, // NoSuchSession
  207: 400, // InvalidUUID
  208: 500, // TooManyLocks
  209: 400, // StaleClusterTime
  210: 400, // CannotVerifyAndSignLogicalTime
  211: 404, // KeyNotFound
  212: 400, // IncompatibleRollbackAlgorithm
  213: 400, // DuplicateSession
  214: 403, // AuthenticationRestrictionUnmet
  215: 500, // DatabaseDropPending
  216: 500, // ElectionInProgress
  217: 400, // IncompleteTransactionHistory
  218: 400, // UpdateOperationFailed
  219: 500, // FTDCPathNotSet
  220: 500, // FTDCPathAlreadySet
  221: 400, // IndexModified
  222: 400, // CloseChangeStream
  223: 400, // IllegalOpMsgFlag
  224: 400, // QueryFeatureNotAllowed
  225: 400, // TransactionTooOld
  226: 400, // AtomicityFailure
  227: 400, // CannotImplicitlyCreateCollection
  228: 400, // SessionTransferIncomplete
  229: 400, // MustDowngrade
  230: 404, // DNSHostNotFound
  231: 400, // DNSProtocolError
  232: 400, // MaxSubPipelineDepthExceeded
  233: 400, // TooManyDocumentSequences
  234: 400, // RetryChangeStream
  235: 400, // InternalErrorNotSupported
  236: 400, // ForTestingErrorExtraInfo
  237: 400, // CursorKilled
  238: 400, // NotImplemented
  239: 400, // SnapshotTooOld
  240: 400, // DNSRecordTypeMismatch
  241: 400, // ConversionFailure
  242: 400, // CannotCreateCollection
  243: 400, // IncompatibleWithUpgradedServer
  245: 400, // BrokenPromise
  246: 400, // SnapshotUnavailable
  247: 400, // ProducerConsumerQueueBatchTooLarge
  248: 400, // ProducerConsumerQueueEndClosed
  249: 400, // StaleDbVersion
  250: 400, // StaleChunkHistory
  251: 400, // NoSuchTransaction
  252: 400, // ReentrancyNotAllowed
  253: 400, // FreeMonHttpInFlight
  254: 400, // FreeMonHttpTemporaryFailure
  255: 400, // FreeMonHttpPermanentFailure
  256: 400, // TransactionCommitted
  257: 413, // TransactionTooLarge
  258: 400, // UnknownFeatureCompatibilityVersion
  259: 400, // KeyedExecutorRetry
  260: 400, // InvalidResumeToken
  261: 400, // TooManyLogicalSessions
  262: 408, // ExceededTimeLimit
  263: 400, // OperationNotSupportedInTransaction
  264: 400, // TooManyFilesOpen
  265: 400, // OrphanedRangeCleanUpFailed
  266: 400, // FailPointSetFailed
  267: 400, // PreparedTransactionInProgress
  268: 400, // CannotBackup
  269: 400, // DataModifiedByRepair
  270: 400, // RepairedReplicaSetNode
  271: 400, // JSInterpreterFailureWithStack
  272: 400, // MigrationConflict
  273: 400, // ProducerConsumerQueueProducerQueueDepthExceeded
  274: 400, // ProducerConsumerQueueConsumed
  275: 400, // ExchangePassthrough
  276: 400, // IndexBuildAborted
  277: 400, // AlarmAlreadyFulfilled
  278: 400, // UnsatisfiableCommitQuorum
  279: 400, // ClientDisconnect
  280: 400, // ChangeStreamFatalError
  281: 400, // TransactionCoordinatorSteppingDown
  282: 400, // TransactionCoordinatorReachedAbortDecision
  283: 400, // WouldChangeOwningShard
  284: 400, // ForTestingErrorExtraInfoWithExtraInfoInNamespace
  285: 400, // IndexBuildAlreadyInProgress
  286: 400, // ChangeStreamHistoryLost
  287: 400, // TransactionCoordinatorDeadlineTaskCanceled
  288: 400, // ChecksumMismatch
  289: 400, // WaitForMajorityServiceEarlierOpTimeAvailable
  290: 400, // TransactionExceededLifetimeLimitSeconds
  291: 400, // NoQueryExecutionPlans
  292: 400, // QueryExceededMemoryLimitNoDiskUseAllowed
  293: 400, // InvalidSeedList
  294: 400, // InvalidTopologyType
  295: 400, // InvalidHeartBeatFrequency
  296: 400, // TopologySetNameRequired
  297: 400, // HierarchicalAcquisitionLevelViolation
  298: 400, // InvalidServerType
  299: 400, // OCSPCertificateStatusRevoked
  300: 400, // RangeDeletionAbandonedBecauseCollectionWithUUIDDoesNotExist
  301: 400, // DataCorruptionDetected
  302: 400, // OCSPCertificateStatusUnknown
  303: 400, // SplitHorizonChange
  304: 400, // ShardInvalidatedForTargeting
  307: 400, // RangeDeletionAbandonedBecauseTaskDocumentDoesNotExist
  308: 400, // CurrentConfigNotCommittedYet
  309: 400, // ExhaustCommandFinished
  310: 400, // PeriodicJobIsStopped
  311: 400, // TransactionCoordinatorCanceled
  312: 400, // OperationIsKilledAndDelisted
  313: 400, // ResumableRangeDeleterDisabled
  314: 400, // ObjectIsBusy
  315: 400, // TooStaleToSyncFromSource
  316: 400, // QueryTrialRunCompleted
  317: 400, // ConnectionPoolExpired
  318: 400, // ForTestingOptionalErrorExtraInfo
  319: 400, // MovePrimaryInProgress
  320: 400, // TenantMigrationConflict
  321: 400, // TenantMigrationCommitted
  322: 400, // APIVersionError
  323: 400, // APIStrictError
  324: 400, // APIDeprecationError
  325: 400, // TenantMigrationAborted
  326: 400, // OplogQueryMinTsMissing
  327: 400, // NoSuchTenantMigration
  328: 400, // TenantMigrationAccessBlockerShuttingDown
  329: 400, // TenantMigrationInProgress
  330: 400, // SkipCommandExecution
  331: 400, // FailedToRunWithReplyBuilder
  332: 400, // CannotDowngrade
  333: 400, // ServiceExecutorInShutdown
  334: 400, // MechanismUnavailable
  335: 400, // TenantMigrationForgotten
  9001: 500, // SocketException
  10003: 400, // CannotGrowDocumentInCappedNamespace
  10107: 500, // NotWritablePrimary
  10334: 400, // BSONObjectTooLarge
  11000: 400, // DuplicateKey
  11600: 500, // InterruptedAtShutdown
  11601: 500, // Interrupted
  11602: 500, // InterruptedDueToReplStateChange
  12586: 500, // BackgroundOperationInProgressForDatabase
  12587: 500, // BackgroundOperationInProgressForNamespace
  13113: 404, // MergeStageNoMatchingDocument
  13297: 500, // DatabaseDifferCase
  13388: 400, // StaleConfig
  13435: 500, // NotPrimaryNoSecondaryOk
  13436: 500, // NotPrimaryOrSecondary
  14031: 500, // OutOfDiskSpace
  46841: 500, // ClientMarkedKilled
};

export const mapMongoErrorToHttpStatus = (e: number): number =>
  errorCodeToHttpStatus[e] || 500;
