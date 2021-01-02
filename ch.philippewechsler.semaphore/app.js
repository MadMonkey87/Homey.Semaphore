'use strict';

const Homey = require('homey');
var AsyncLock = require('async-lock');
const { util } = require('./util');

class SemaphoreApp extends Homey.App {

  WaitAndLock = async function (attempts, timeout, log, mutex) {

    async function LockAttempt() {
      await util.sleep(100);
      if (global.isLocked === false) {
        log('locked successful');
        global.isLocked = true;
        return true;
      }
      else {
        log('semaphore is already locked, waiting');
        return false;
      }
    }

    for (let i = 1; i <= attempts; i++) {
      let attemptResult = await mutex.acquire('unique_key', LockAttempt);
      log('attempt ' + i + ' is successfull: ' + attemptResult);
      if (attemptResult) {
        return Promise.resolve(true);
      }
      await util.sleep(timeout);
    }

    log('unable to lock after ' + attempts + ' attempts');
    return Promise.resolve(false);
  }

  Unlock = async function (log, mutex) {

    async function UnlockAttempt() {
      global.isLocked = false;
      log('unlocked');
    }

    await mutex.acquire('unique_key', UnlockAttempt);
    return Promise.resolve(true);
  }

  async onInit() {
    this.log('SemaphoreApp has been initialized');

    global.isLocked = false;
    this.mutex = new AsyncLock();

    let lockCondition = new Homey.FlowCardCondition('lock');
    lockCondition
      .register()
      .registerRunListener(async (args, state) => {
        try {
          return await this.WaitAndLock(60, 50, this.log, this.mutex);
        } catch (error) {
          this.log('error while locking', error);
          return Promise.reject(error);
        }
      });

    let unlockAction = new Homey.FlowCardAction('unlock');
    unlockAction
      .register()
      .registerRunListener(async (args, state) => {
        try {
          return await this.Unlock(this.log, this.mutex);
        } catch (error) {
          this.log('error while unlocking', error);
          return Promise.reject(error);
        }
      });
  }

}

module.exports = SemaphoreApp;