Device Types
============

> This repository contains a collection of contracts that define device types.

The entities declared in this repository are:

| Entity          | Description                                 | Example                       |
|-----------------|---------------------------------------------|-------------------------------|
| `architecture`  | A precise architecture string               | `armv7at2hf-vfp-neon-vfpv4`   |
| `processor`     | A processor that implements an architecture | ARM Cortex A8                 |
| `device_family` | A family of device types                    | Raspberry Pi                  |
| `device_type`   | A device model, part of a device family     | Raspberry Pi 3 Model B        |
| `device_sku`    | A precise instantiation of a device type    | Raspberry Pi Model A+ rev 1.1 |

Relationships
-------------

- A `processor` *implements* an `architecture`
- A `device_type` *belongs* to a `device_family`
- A `device_sku` *includes* a `processor`
- A `device_sku` *belongs* to a `device_type`

Rules
-----

- Each contract file name should equal its own slug
- Each contract slug should be unique, even among different contract types

License
-------

The project is licensed under the Apache 2.0 license.
