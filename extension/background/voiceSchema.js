/* eslint-disable */
// This is a copy of:
// https://github.com/mozilla-services/mozilla-pipeline-schemas/blob/master/schemas/telemetry/voice/voice.4.schema.json
// When this is updated also please update metrics.md
// prettier-ignore

export const schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "properties": {
    "application": {
      "additionalProperties": false,
      "properties": {
        "architecture": {
          "type": "string"
        },
        "buildId": {
          "pattern": "^[0-9]{10}",
          "type": "string"
        },
        "channel": {
          "type": "string"
        },
        "displayVersion": {
          "pattern": "^[0-9]{2,3}\\.",
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "platformVersion": {
          "pattern": "^[0-9]{2,3}\\.",
          "type": "string"
        },
        "vendor": {
          "type": "string"
        },
        "version": {
          "pattern": "^[0-9]{2,3}\\.",
          "type": "string"
        },
        "xpcomAbi": {
          "type": "string"
        }
      },
      "required": [
        "architecture",
        "buildId",
        "channel",
        "name",
        "platformVersion",
        "version",
        "vendor",
        "xpcomAbi"
      ],
      "type": "object"
    },
    "clientId": {
      "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$",
      "type": "string"
    },
    "creationDate": {
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$",
      "type": "string"
    },
    "environment": {
      "properties": {
        "addons": {
          "properties": {
            "activeAddons": {
              "additionalProperties": {
                "properties": {
                  "appDisabled": {
                    "type": "boolean"
                  },
                  "blocklisted": {
                    "type": "boolean"
                  },
                  "description": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "foreignInstall": {
                    "type": [
                      "integer",
                      "boolean"
                    ]
                  },
                  "hasBinaryComponents": {
                    "type": "boolean"
                  },
                  "installDay": {
                    "minimum": 0,
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "isSystem": {
                    "type": "boolean"
                  },
                  "isWebExtension": {
                    "type": "boolean"
                  },
                  "multiprocessCompatible": {
                    "type": "boolean"
                  },
                  "name": {
                    "type": "string"
                  },
                  "scope": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "signedState": {
                    "type": "integer"
                  },
                  "type": {
                    "type": "string"
                  },
                  "updateDay": {
                    "minimum": 0,
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "userDisabled": {
                    "type": [
                      "boolean",
                      "integer"
                    ]
                  },
                  "version": {
                    "type": [
                      "string",
                      "number"
                    ]
                  }
                },
                "type": "object"
              },
              "type": "object"
            },
            "activeExperiment": {
              "properties": {
                "branch": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "activeGMPlugins": {
              "additionalProperties": {
                "properties": {
                  "applyBackgroundUpdates": {
                    "type": [
                      "integer",
                      "boolean"
                    ]
                  },
                  "userDisabled": {
                    "type": "boolean"
                  },
                  "version": {
                    "type": [
                      "string",
                      "null"
                    ]
                  }
                },
                "type": "object"
              },
              "type": "object"
            },
            "activePlugins": {
              "items": {
                "properties": {
                  "blocklisted": {
                    "type": "boolean"
                  },
                  "clicktoplay": {
                    "type": "boolean"
                  },
                  "description": {
                    "type": "string"
                  },
                  "disabled": {
                    "type": "boolean"
                  },
                  "mimeTypes": {
                    "items": {
                      "type": "string"
                    },
                    "type": "array"
                  },
                  "name": {
                    "type": "string"
                  },
                  "updateDay": {
                    "type": "integer"
                  },
                  "version": {
                    "type": "string"
                  }
                },
                "type": "object"
              },
              "type": "array"
            },
            "persona": {
              "type": [
                "string",
                "null"
              ]
            },
            "theme": {
              "properties": {
                "appDisabled": {
                  "type": "boolean"
                },
                "blocklisted": {
                  "type": "boolean"
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ]
                },
                "foreignInstall": {
                  "type": [
                    "boolean",
                    "integer"
                  ]
                },
                "hasBinaryComponents": {
                  "type": "boolean"
                },
                "id": {
                  "type": "string"
                },
                "installDay": {
                  "minimum": 0,
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "name": {
                  "type": "string"
                },
                "scope": {
                  "type": "integer"
                },
                "updateDay": {
                  "minimum": 0,
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "userDisabled": {
                  "type": "boolean"
                },
                "version": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "type": "object"
        },
        "build": {
          "properties": {
            "applicationId": {
              "type": "string"
            },
            "applicationName": {
              "type": "string"
            },
            "architecture": {
              "type": "string"
            },
            "architecturesInBinary": {
              "type": "string"
            },
            "buildId": {
              "pattern": "^[0-9]{10}",
              "type": "string"
            },
            "displayVersion": {
              "pattern": "^[0-9]{2,3}\\.",
              "type": "string"
            },
            "hotfixVersion": {
              "type": [
                "string",
                "null"
              ]
            },
            "platformVersion": {
              "pattern": "^[0-9]{2,3}\\.",
              "type": "string"
            },
            "updaterAvailable": {
              "type": "boolean"
            },
            "vendor": {
              "type": [
                "string",
                "null"
              ]
            },
            "version": {
              "pattern": "^[0-9]{2,3}\\.",
              "type": "string"
            },
            "xpcomAbi": {
              "type": "string"
            }
          },
          "required": [
            "applicationId",
            "applicationName",
            "architecture",
            "buildId",
            "version",
            "vendor",
            "platformVersion",
            "xpcomAbi"
          ],
          "type": "object"
        },
        "experiments": {
          "additionalProperties": {
            "properties": {
              "branch": {
                "type": "string"
              },
              "enrollmentId": {
                "type": "string"
              },
              "type": {
                "type": "string"
              }
            },
            "type": "object"
          },
          "type": "object"
        },
        "partner": {
          "properties": {
            "distributionId": {
              "type": [
                "string",
                "null"
              ]
            },
            "distributionVersion": {
              "type": [
                "string",
                "null"
              ]
            },
            "distributor": {
              "type": [
                "string",
                "null"
              ]
            },
            "distributorChannel": {
              "type": [
                "string",
                "null"
              ]
            },
            "partnerId": {
              "type": [
                "string",
                "null"
              ]
            },
            "partnerNames": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "profile": {
          "properties": {
            "creationDate": {
              "type": "number"
            },
            "firstUseDate": {
              "type": "number"
            },
            "isStubProfile": {
              "type": "boolean"
            },
            "resetDate": {
              "type": "number"
            }
          },
          "type": "object"
        },
        "services": {
          "properties": {
            "accountEnabled": {
              "type": "boolean"
            },
            "syncEnabled": {
              "type": "boolean"
            }
          },
          "type": "object"
        },
        "settings": {
          "properties": {
            "addonCompatibilityCheckEnabled": {
              "type": "boolean"
            },
            "attribution": {
              "properties": {
                "campaign": {
                  "type": "string"
                },
                "content": {
                  "type": "string"
                },
                "experiment": {
                  "description": "funnel experiment parameters, see bug 1567339",
                  "type": "string"
                },
                "medium": {
                  "type": "string"
                },
                "source": {
                  "type": "string"
                },
                "ua": {
                  "description": "derived user agent, see bug 1595063",
                  "type": "string"
                },
                "variation": {
                  "description": "funnel experiment parameters, see bug 1567339",
                  "type": "string"
                }
              },
              "type": "object"
            },
            "blocklistEnabled": {
              "type": "boolean"
            },
            "defaultPrivateSearchEngine": {
              "type": "string"
            },
            "defaultPrivateSearchEngineData": {
              "properties": {
                "loadPath": {
                  "type": [
                    "string",
                    "null"
                  ]
                },
                "name": {
                  "type": "string"
                },
                "origin": {
                  "type": "string"
                },
                "submissionURL": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "defaultSearchEngine": {
              "type": "string"
            },
            "defaultSearchEngineData": {
              "properties": {
                "loadPath": {
                  "type": [
                    "string",
                    "null"
                  ]
                },
                "name": {
                  "type": "string"
                },
                "origin": {
                  "type": "string"
                },
                "submissionURL": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "e10sCohort": {
              "type": "string"
            },
            "e10sEnabled": {
              "type": "boolean"
            },
            "e10sMultiProcesses": {
              "description": "maximum number of processes that will be launched for regular web content",
              "type": "integer"
            },
            "intl": {
              "properties": {
                "acceptLanguages": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "appLocales": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "availableLocales": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "regionalPrefsLocales": {
                  "items": {
                    "type": "string"
                  },
                  "type": [
                    "array",
                    "null"
                  ]
                },
                "requestedLocales": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "systemLocales": {
                  "items": {
                    "type": "string"
                  },
                  "type": [
                    "array",
                    "null"
                  ]
                }
              },
              "type": "object"
            },
            "isDefaultBrowser": {
              "type": [
                "boolean",
                "null"
              ]
            },
            "isInOptoutSample": {
              "type": [
                "boolean",
                "null"
              ]
            },
            "launcherProcessState": {
              "type": "integer"
            },
            "locale": {
              "type": "string"
            },
            "sandbox": {
              "properties": {
                "effectiveContentProcessLevel": {
                  "type": [
                    "integer",
                    "null"
                  ]
                }
              },
              "type": "object"
            },
            "searchCohort": {
              "type": [
                "string",
                "null"
              ]
            },
            "telemetryEnabled": {
              "type": "boolean"
            },
            "update": {
              "properties": {
                "autoDownload": {
                  "type": "boolean"
                },
                "channel": {
                  "type": "string"
                },
                "enabled": {
                  "type": "boolean"
                }
              },
              "type": "object"
            },
            "userPrefs": {
              "additionalProperties": {
                "type": [
                  "boolean",
                  "string",
                  "number",
                  "null"
                ]
              },
              "type": "object"
            }
          },
          "type": "object"
        },
        "system": {
          "properties": {
            "appleModelId": {
              "type": [
                "string",
                "null"
              ]
            },
            "cpu": {
              "properties": {
                "cores": {
                  "maximum": 2048,
                  "minimum": 1,
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "count": {
                  "maximum": 1024,
                  "minimum": 1,
                  "type": "integer"
                },
                "extensions": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "family": {
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "l2cacheKB": {
                  "type": [
                    "number",
                    "null"
                  ]
                },
                "l3cacheKB": {
                  "type": [
                    "number",
                    "null"
                  ]
                },
                "model": {
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "speedMHz": {
                  "type": [
                    "number",
                    "null"
                  ]
                },
                "stepping": {
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "vendor": {
                  "type": [
                    "string",
                    "null"
                  ]
                }
              },
              "type": "object"
            },
            "device": {
              "properties": {
                "hardware": {
                  "type": "string"
                },
                "isTablet": {
                  "type": "boolean"
                },
                "manufacturer": {
                  "type": "string"
                },
                "model": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "gfx": {
              "properties": {
                "ContentBackend": {
                  "type": "string"
                },
                "D2DEnabled": {
                  "type": [
                    "boolean",
                    "null"
                  ]
                },
                "DWriteEnabled": {
                  "type": [
                    "boolean",
                    "null"
                  ]
                },
                "Headless": {
                  "type": [
                    "boolean",
                    "null"
                  ]
                },
                "LowEndMachine": {
                  "type": "boolean"
                },
                "adapters": {
                  "items": {
                    "properties": {
                      "GPUActive": {
                        "type": "boolean"
                      },
                      "RAM": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "deviceID": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "driver": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "driverDate": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "driverVersion": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "subsysID": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "vendorID": {
                        "type": [
                          "string",
                          "null"
                        ]
                      }
                    },
                    "type": "object"
                  },
                  "type": "array"
                },
                "features": {
                  "properties": {
                    "advancedLayers": {
                      "properties": {
                        "noConstantBufferOffsetting": {
                          "type": [
                            "boolean",
                            "null"
                          ]
                        },
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    },
                    "compositor": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "d2d": {
                      "properties": {
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "version": {
                          "type": [
                            "string",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    },
                    "d3d11": {
                      "properties": {
                        "blacklisted": {
                          "type": [
                            "boolean",
                            "null"
                          ]
                        },
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "textureSharing": {
                          "type": [
                            "boolean",
                            "null"
                          ]
                        },
                        "version": {
                          "type": [
                            "number",
                            "null"
                          ]
                        },
                        "warp": {
                          "type": [
                            "boolean",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    },
                    "gpuProcess": {
                      "properties": {
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    },
                    "webrender": {
                      "properties": {
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    },
                    "wrQualified": {
                      "properties": {
                        "status": {
                          "type": [
                            "string",
                            "null"
                          ]
                        }
                      },
                      "type": "object"
                    }
                  },
                  "type": "object"
                },
                "monitors": {
                  "items": {
                    "properties": {
                      "pseudoDisplay": {
                        "type": "boolean"
                      },
                      "refreshRate": {
                        "type": "number"
                      },
                      "scale": {
                        "type": "number"
                      },
                      "screenHeight": {
                        "type": "integer"
                      },
                      "screenWidth": {
                        "type": "integer"
                      }
                    },
                    "type": "object"
                  },
                  "type": "array"
                }
              },
              "type": "object"
            },
            "hdd": {
              "properties": {
                "binary": {
                  "properties": {
                    "model": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "revision": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "type": {
                      "enum": [
                        "SSD",
                        "HDD",
                        null
                      ],
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  },
                  "type": "object"
                },
                "profile": {
                  "properties": {
                    "model": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "revision": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "type": {
                      "enum": [
                        "SSD",
                        "HDD",
                        null
                      ],
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  },
                  "type": "object"
                },
                "system": {
                  "properties": {
                    "model": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "revision": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "type": {
                      "enum": [
                        "SSD",
                        "HDD",
                        null
                      ],
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  },
                  "type": "object"
                }
              },
              "type": "object"
            },
            "isWow64": {
              "type": "boolean"
            },
            "isWowARM64": {
              "type": [
                "boolean",
                "null"
              ]
            },
            "memoryMB": {
              "type": "number"
            },
            "os": {
              "properties": {
                "installYear": {
                  "type": [
                    "number",
                    "null"
                  ]
                },
                "kernelVersion": {
                  "type": "string"
                },
                "locale": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "servicePackMajor": {
                  "type": "number"
                },
                "servicePackMinor": {
                  "type": "number"
                },
                "version": {
                  "type": [
                    "string"
                  ]
                },
                "windowsBuildNumber": {
                  "type": "number"
                },
                "windowsUBR": {
                  "type": [
                    "number",
                    "null"
                  ]
                }
              },
              "type": "object"
            },
            "sec": {
              "properties": {
                "antispyware": {
                  "items": {
                    "type": "string"
                  },
                  "type": [
                    "array",
                    "null"
                  ]
                },
                "antivirus": {
                  "items": {
                    "type": "string"
                  },
                  "type": [
                    "array",
                    "null"
                  ]
                },
                "firewall": {
                  "items": {
                    "type": "string"
                  },
                  "type": [
                    "array",
                    "null"
                  ]
                }
              },
              "type": "object"
            },
            "virtualMaxMB": {
              "type": [
                "number",
                "null"
              ]
            }
          },
          "type": "object"
        }
      },
      "required": [
        "build",
        "partner",
        "settings",
        "system"
      ],
      "type": "object"
    },
    "id": {
      "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$",
      "type": "string"
    },
    "payload": {
      "properties": {
        "audioTime": {
          "description": "Time in milliseconds of the recording",
          "title": "Amount of spoken time",
          "type": "integer"
        },
        "country": {
          "title": "User country code",
          "type": "string"
        },
        "deepSpeechConfidence": {
          "maximum": 1,
          "minimum": 0,
          "title": "Confidence of DeepSpeech text-to-speech transcription",
          "type": "number"
        },
        "deepSpeechMatches": {
          "title": "Did the DeepSpeech transcription match with Google's?",
          "type": "boolean"
        },
        "deepSpeechServerTime": {
          "description": "Milliseconds for the DeepSpeech transcription to complete and respond",
          "title": "Response time of DeepSpeech server",
          "type": "integer"
        },
        "extensionInstallDate": {
          "title": "Timestamp when the extension was installed",
          "type": "integer"
        },
        "extensionInstallationChannel": {
          "description": "Where the user first installed the extension (e.g., internal_beta, external_beta, etc)",
          "title": "First install channel",
          "type": "string"
        },
        "extensionTemporaryInstall": {
          "description": "When the extension is installed locally for development, this will be true",
          "title": "Temporary Install?",
          "type": "boolean"
        },
        "extensionVersion": {
          "title": "Firefox Voice extension version",
          "type": "string"
        },
        "hasCard": {
          "title": "Does the intent produce a card-like output?",
          "type": "boolean"
        },
        "inputCancelled": {
          "title": "Was the interaction cancelled?",
          "type": "boolean"
        },
        "inputLength": {
          "minimum": 0,
          "title": "Number of characters in text/voice input",
          "type": "integer"
        },
        "inputTyped": {
          "title": "Was the input typed on the keyboard?",
          "type": "boolean"
        },
        "intent": {
          "description": "This should begin with intent_category.exact_intent",
          "title": "Full name of the intent handler",
          "type": "string"
        },
        "intentCategory": {
          "title": "Category of the intent handler",
          "type": "string"
        },
        "intentConfidence": {
          "maximum": 1,
          "minimum": 0,
          "title": "Confidence of the intent parsing",
          "type": "number"
        },
        "intentExtensionId": {
          "description": "If intent was handled by another extension, the id of that extension",
          "title": "ID of second extension that handled intent",
          "type": "string"
        },
        "intentExtensionVersion": {
          "description": "The self-reported title of an extension that handled the intent",
          "title": "Title of second extension",
          "type": "string"
        },
        "intentExtraData": {
          "description": "A specific intent can add information here about how it interepreted the command",
          "title": "Ad hoc intent-specific data",
          "type": "object"
        },
        "intentFallback": {
          "description": "True if we couldn't parse the intent to some exact handler, and just fell back on something generic like search",
          "title": "Was this a fallback intent handler?",
          "type": "boolean"
        },
        "intentId": {
          "title": "A unique random ID specific to this intent execution",
          "type": "string"
        },
        "intentParseSuccess": {
          "title": "Was this intent parsed successfully?",
          "type": "boolean"
        },
        "intentServiceName": {
          "description": "If an intent used some external service, what service did it choose?",
          "title": "What service did the intent handler use?",
          "type": "string"
        },
        "intentSuccess": {
          "description": "This is the self-reported success of the intent handler",
          "title": "Was the intent action successful?",
          "type": "boolean"
        },
        "intentTime": {
          "description": "Milliseconds between getting the utterance and execution the intent",
          "title": "Time to execute the intent",
          "type": "integer"
        },
        "internalError": {
          "title": "If there was an unexpected error, the name of that error",
          "type": "string"
        },
        "localHour": {
          "description": "The hour, 0-23, in the local timezone when the action was run",
          "title": "Local hour of action",
          "type": "integer"
        },
        "numberOfOpenTabs": {
          "description": "A count of the number of tabs in all windows, that are open when the tool is activated",
          "title": "Number of open tabs",
          "type": "integer"
        },
        "optInAcceptanceTime": {
          "title": "The timestamp when the user accepted the opt-in",
          "type": "integer"
        },
        "optInAudio": {
          "title": "Has the user opted in to audio?",
          "type": "boolean"
        },
        "serverErrorIntentParser": {
          "description": "Error with the server intent parser",
          "title": "DEPRECATED",
          "type": "string"
        },
        "serverErrorSpeech": {
          "title": "Error with the server speech-to-text parser",
          "type": "string"
        },
        "serverTimeIntentParser": {
          "description": "Time in milliseconds for server intent parsing",
          "minimum": 0,
          "title": "DEPRECATED",
          "type": "number"
        },
        "serverTimeSpeech": {
          "minimum": 0,
          "title": "Time in milliseconds for server TTS",
          "type": "number"
        },
        "serverVersion": {
          "title": "Server version",
          "type": "string"
        },
        "siteCategoryOpened": {
          "title": "Category of site opened by intent",
          "type": "string"
        },
        "siteCategoryTriggering": {
          "description": "This only set if the intent dependent on the current tab in some way",
          "title": "Category of site of active tab when started",
          "type": "string"
        },
        "timestamp": {
          "minimum": 0,
          "title": "Milliseconds-since-the-epoch when intent was started",
          "type": "number"
        },
        "transcriptionConfidence": {
          "maximum": 1,
          "minimum": 0,
          "title": "Confidence of text-to-speech transcription",
          "type": "number"
        },
        "utterance": {
          "description": "This is the actual text the user spoke",
          "title": "Text utterance by user",
          "type": "string"
        },
        "utteranceChars": {
          "title": "Number of characters in utterance",
          "type": "number"
        },
        "utteranceDeepSpeech": {
          "description": "An alternate transcription for verification",
          "title": "Utterance as transcribed by DeepSpeech",
          "type": "string"
        },
        "utteranceDeepSpeechChars": {
          "title": "Number of characters in DeepSpeech transcription",
          "type": "number"
        },
        "utteranceParsed": {
          "description": "Typically the slots found in the utterance",
          "title": "Parsed form of the utterance",
          "type": "object"
        },
        "wakewordEnabled": {
          "title": "Has the user enabled the wakeword?",
          "type": "boolean"
        },
        "wakewordUsed": {
          "title": "Did the user start the intent with a wakeword, and what wakeword?",
          "type": "string"
        }
      },
      "required": [
        "extensionVersion",
        "extensionTemporaryInstall",
        "timestamp"
      ],
      "type": "object"
    },
    "type": {
      "enum": [
        "voice"
      ],
      "type": "string"
    },
    "version": {
      "maximum": 4,
      "minimum": 4,
      "type": "number"
    }
  },
  "required": [
    "application",
    "clientId",
    "creationDate",
    "environment",
    "id",
    "payload",
    "type",
    "version"
  ],
  "title": "voice",
  "type": "object"
};
