#ifndef __AS_CMDTYPES_H__
#define __AS_CMDTYPES_H__

#include <asplatform/asplatform_all.h>
#include "ascmdlogs.h"
#include <asuri/asuri.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    e_filter_cmd_none,
    e_filter_cmd_info
} as_filter_cmd_e;

/*
 * Enum for command definitions
 * Enum length = sizeof(char)
 */
typedef enum {
    e_as_ls = 0x1,              /* ls */
    e_as_rm,                    /* rm */
    e_as_mv,                    /* mv */
    e_as_du,                    /* size */
    e_as_stat,                  /* stat */
    e_as_info,                  /* info of OS and scp versiona */
    e_as_exit,                  /* exit cmd loop */
    e_as_df,                    /* disk free */
    e_as_md5                    /* md5sum */
} as_cmd_e;

/*
 * Enum for command reply definitions
 * Enum length = sizeof(char)
 */
typedef enum {
    e_as_cmdrpy_file = 0x1,     /* Files */
    e_as_cmdrpy_dir,            /* Dir */
    e_as_cmdrpy_size,           /* Size */
    e_as_cmdrpy_error,          /* Error */
    e_as_cmdrpy_info,           /* Platform info */
    e_as_cmdrpy_success,        /* Cmd success */
    e_as_cmdrpy_exit,           /* Cmd exit */
    e_as_cmdrpy_df,             /* Disk free */
    e_as_cmdrpy_md5sum          /* MD5sum */
} as_ftype_e;

/*
 * Enum for file attribute definitions
 * Enum length = sizeof(char)
 */
typedef enum {
    e_as_st_name = 0x1,         /* File name */
    e_as_st_size,               /* File size */
    e_as_st_mode,               /* File type */
    e_as_st_zmode,              /* File type str */
    e_as_st_uid,                /* File user id of owner */
    e_as_st_zuid,               /* File user id of owner as str */
    e_as_st_gid,                /* File group id of owner */
    e_as_st_zgid,               /* File group id of owner as str */
    e_as_st_ctime,              /* File creation time */
    e_as_st_zctime,             /* File creation time as str */
    e_as_st_mtime,              /* File modification time */
    e_as_st_zmtime,             /* File modification time as str */
    e_as_st_atime,              /* File last access time */
    e_as_st_zatime,             /* File last access time as str */
    e_as_st_symlink,            /* File symlink */
    e_as_st_errno,              /* File errno */
    e_as_st_errstr              /* File error string */
} as_fstat_e;

/*
 * Enum for field types
 */
typedef enum {
    e_as_int = 0x01,            /* int32_t */
    e_as_llint,                 /* int64_t */
    e_as_char,                  /* int8_t */
    e_as_str,                   /* String length */
    e_as_double,                /* int64_t */
    e_as_header                 /* message type + message length */
} as_fdata_e;

/* 
 * Enum for info filed
 */
typedef enum {
    e_as_info_platform = 0x01,  /* Pltform type */
    e_as_info_version,          /* SCP version */
    e_as_info_lang,             /* Platform language */
    e_as_info_territory,        /* Platform territory */
    e_as_info_codeset,          /* Character code */
    e_as_info_lc_ctype,         /* Platform character classification type */
    e_as_info_lc_numeric,       /* Platform non-monetary numeric format */
    e_as_info_lc_time,          /* Platform time format */
    e_as_info_lc_all,           /* Platform all locale */
    e_as_info_dev,              /* Device name */
    e_as_info_browse_caps,      /* Browse capabilities */
    e_as_info_protocol
} as_info_e;

typedef enum {
    e_as_size = 0x01,           /* Size */
    e_as_fcount,                /* File count */
    e_as_dcount,                /* Directory count */
    e_as_failed_fcount,         /* Failed file count */
    e_as_failed_dcount          /* Failed directory count */
} as_size_e;

typedef enum {
    e_as_errno = 0x01,          /* Errno */
    e_as_errstr                 /* Error string */
} as_error_e;

typedef enum {
    e_as_mnt_fs = 0x01,         /* File system name */
    e_as_mnt_dir,               /* Mount point */
    e_as_mnt_type,              /* Mount type */
    e_as_mnt_total,             /* Total disk space */
    e_as_mnt_used,              /* Used disk space */
    e_as_mnt_free,              /* Available disk space */
    e_as_mnt_fcount,            /* File count */
    e_as_mnt_errno,             /* Mount errno */
    e_as_mnt_errstr             /* Mount error string */
} as_mnt_e;

typedef enum {
    e_as_md5sum = 0x01          /* md5sum as a string */
} as_md5sum_e;

typedef struct as_docroot_t {
    char *_original_docroot;
    char _path[AS_MAX_PATH * 3 + 1];
    char *_query;
    as_uri_t *_uri;
    bool_t _is_uri;
} as_docroot_t;

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* __AS_CMDTYPES_H__ */

